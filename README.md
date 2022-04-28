# data-security-for-sale

# Overview
This repository builds off the work done by Tyler Dukes, found in this [Github repo](https://github.com/mcclatchy-southeast/security_for_sale). This repository takes the ouptut from there and preprocess some of it for use in the article Security For Sale, published by The Charlotte Observer and Raleigh's News & Observer. Further explanation of the step by step process can be found in the `preprocessing_map_data.ipynb` notebook.

The main hexbinning script lightly modifies the work done by [Chris Henrick](https://gist.github.com/clhenrick) with Turf for [creating hexbins](https://gist.github.com/clhenrick/5787a12a8bf3b02821839e4f9556d997). I started looking into creating [Wurman dots](https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/wurman-dots-bringing-back-the-60s/) as well in the `hexbin-processing.js` script.

There are several Python package requirements (I didn't make a `pipenv` or equivalent file...)
  - [shapely](https://shapely.readthedocs.io/en/stable/manual.html)
  - [topojson](https://github.com/mattijn/topojson)
  - [overpass](https://github.com/mvexel/overpass-api-python-wrapper) (OpenStreetMap accessor)
  - [pandas](https://pandas.pydata.org/)

There are a few Node package requirements covered in the `package.json`
  - [turf](https://turfjs.org/)
  - [simple-statistics](https://www.npmjs.com/package/simple-statistics)
  - [d3-array](https://github.com/d3/d3-array)

And there is a requirement to downloand and install this binary locally:
  - [mapshaper](https://github.com/mbloch/mapshaper/)


# Data
The primary data used in the analysis can be found [here](https://github.com/mcclatchy-southeast/security_for_sale).

Additional data for parcels comes from the [County of Mecklenburg](http://maps.co.mecklenburg.nc.us/openmapping/data.html?search=tax%20parcel%20ownership%20data).

Drawing neighborhood shapes made use of [geojson.io](geojson.io).
