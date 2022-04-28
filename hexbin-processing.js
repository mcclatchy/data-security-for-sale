// load libraries
const fs = require("fs")
const turf = require("@turf/turf")
const turfMeta = require("@turf/meta")
const simpleStats = require("simple-statistics")
const d3 = require("d3-array")

const dataDirectory = "./data"

function getMultiplier(value, breaks, multipliers) {
  if (!value) {
    return null;
  }
  let multiplier;
  let found = false;
  let i = 1;
  while (found == false && i <= multipliers.length) {
    if (value <= breaks[i]) {
      multiplier = multipliers[i - 1];
      found = true;
    } else {
      i ++;
    }
  }
  return multiplier ? multiplier : null;
}

function output_aggregated_geodata(inputFilename, outputFilename, hexSide, hex=true, wurman=false) {
  // load our data
  const data = require(`${dataDirectory}/${inputFilename}`)

  // rough geographic bounding box of North Carolina
  const bbox = [-84.821869, 33.842316, -74.960621, 36.588117]

  // size in miles we want each side of our hex grids
  const cellSide = hexSide // 2 for large grid, .2 for small grid

  // create the hexbin geometry for the given bbox and cell resolution
  const options = {triangles: false, units: 'miles'}
  const hexGrid = turf.hexGrid(bbox, cellSide, options)

  // perform a "spatial join" on our hexGrid geometry and our crashes point data
  const collected = turf.collect(hexGrid, data, "residences", "values")

  // get rid of polygons with no joined data, to reduce our final output file size
  collected.features = collected.features.filter(d => d.properties.values.length)

  // count the number of crashes per hexbin
  turfMeta.propEach(collected, props => {
    props.count = props.values.reduce((acc, cur) => acc += 1, 0)
  })

  // reduce our count values to a new array of numbers
  const reduced = turfMeta.featureReduce(collected, (acc, cur) => {
    acc.push(cur.properties.count)
    return acc
  }, [])

  // compute the ckMeans binning for data into 7 classes from reduced values
  const numBins = 7;
  const ck = simpleStats.ckmeans(reduced, numBins)

  // tack on the bin number to our data, as well as its min and max values
  turfMeta.propEach(collected, props => {
    ck.forEach((bin, index) => {
      if (bin.indexOf(props.count) > -1) {
        props.bin = index
        props.binVal = d3.extent(bin)
      }
    })
  })

  // remove the "values" property from our hexBins as it's no longer needed
  turfMeta.propEach(collected, props => {
    delete props.values
  })

  // write output data
  let outputFilepath = `${dataDirectory}/${outputFilename}`;
  fs.writeFileSync(outputFilepath, JSON.stringify(collected));
  console.log(`Output hexagon file: ${outputFilepath}`);

  if (wurman) {
    create_wurman_dots(collected);
  }
}




function create_wurman_dots(collected) {
  let innerCircles = {
    "type": "FeatureCollection",
    "features": []
  }
  let outerCircles = {
    "type": "FeatureCollection",
    "features": []
  }
  let innerMultipliers = [.3, .6, .8, 1, 1, 1, 1]
  // let breaks = [1, 2, 10, 50, 100, 500, 1000, 100000]
  let breaks = [1, 2, 3, 5, 10, 20, 200, 100000]

  collected.features.forEach(polygon => {
    let properties = polygon.properties
    let centroid = turf.centroid(polygon);
    let center = centroid.geometry.coordinates;

    // This would be the outer circle grid of the Wurman dot
    let outerDistance = Math.sqrt(3)/2 * cellSide *.95;
    let outerCircle = turf.circle(center, outerDistance, options);
    outerCircle.properties = properties
    outerCircles.features.push(outerCircle)

    // This would be the inner circle of the Wurman dot
    let innerMultiplier = getMultiplier(properties.count, breaks, innerMultipliers)

    let innerDistance = outerDistance * innerMultiplier;
    let innerCircle = turf.circle(center, innerDistance, options);
    innerCircle.properties = polygon.properties
    innerCircles.features.push(innerCircle)
  })
  
  fs.writeFileSync(`${dataDirectory}/wurmanOuterCircles.json`, JSON.stringify(outerCircles))
  fs.writeFileSync(`${dataDirectory}/wurmanInnerCircles.json`, JSON.stringify(innerCircles))
}

// Reading in simple command line args
// USAGE: node hexbin-processing.js --data=investor_owned_residences --side=2
const args = require('minimist')(process.argv.slice(2));
let inputFilename = args.input;
let hexSideLength = args.side;
let outputFilename = args?.output;

output_aggregated_geodata(inputFilename, outputFilename, hexSideLength)


