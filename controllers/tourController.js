// const fs = require('fs');
const Tour = require('../models/tourModel');

// //without the JSON,parse the file is nothing but text, now its an array of objects
// const tours = JSON.parse(
//   fs.readFileSync(
//     `${__dirname}/../dev-data/data/tours-simple.json`
//   )
// );

// #) ROUTE HANDLERS

exports.getAllTour = async (req, res) => {
  try {
    //Build Query
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];
    excludedFields.forEach(
      (element) => delete queryObj[element]
    );

    //1B) Advanced filtering

    let queryStr = JSON.stringify(queryObj);
    //search for keywords and if there is a result then turn it to...
    //e.g '$lt': '1500'
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    // console.log(JSON.parse(queryStr));
    //

    //find '$lt': '1500' and use that to filter,
    //query could then be chained with other logic(add onto the change we did)
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting

    //continue chaining the change we did to query
    //if request.query has a sort property,
    if (req.query.sort) {
      //select only that specific property and nothing after it
      //"sort=price,ratingsAverage" we sort with price first
      const sortBy = req.query.sort
        .split(',')
        .join(' ');
      query = query.sort(sortBy);
      //"sort=price ratingsAverage"
    } else {
      //created at specific time sort
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    //field limiting means displaying only specific properties
    if (req.query.fields) {
      //select only that specific property and nothing after it
      //output "name duration difficulty price"
      const fields = req.query.fields
        .split(',')
        .join(' ');
      //'select' mean only output the fields and with logic from query
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    //a nice way to turn string into a number
    //if there is no page info then default to 1 or 100
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    //formula for page skipping, no need to memorize
    const skip = (page - 1) * limit;
    //'limit' is the amount of results you want
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip > numTours)
        throw new Error(
          'This page does not exist'
        );
    }

    //execute query
    const tours = await query;

    // console.log(req.query);
    // console.log(req.query, queryObj);

    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    /*send back the response as a json object(specially for 'status')
        because 'tours' is already one */
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(
      req.params.id
    );

    /*send back the response as a json object(specially for 'status')
        because 'tours' is already one */
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    //create a new request body object data that usually comes with POST
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = async (req, res) => {
  //"new: true" its to allow you to return updated document
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
