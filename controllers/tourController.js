// const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

//

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

//

// //without the JSON,parse the file is nothing but text, now its an array of objects
// const tours = JSON.parse(
//   fs.readFileSync(
//     `${__dirname}/../dev-data/data/tours-simple.json`
//   )
// );

//

exports.getAllTour = async (req, res) => {
  try {
    //EXECUTE QUERY

    //Literally passing in the method .Find() to constructor
    const features = new APIFeatures(
      Tour.find(),
      req.query
    ) //the reason for why chaining work is because all of the methods returns "this"
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //

    const tours = await features.query;

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

//

//

//

//

//

//

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

//

//

//

//To aggregate(add all the data together into one, to get an average or sum of everything)
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        //only select documents with ratings great than or equal to...
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        //SORT BY GROUP like price, difficulty, ect
        $group: {
          //aggregate all data to each one only with exact difficulty level or ratingsAverage
          _id: { $toUpper: '$difficulty' },
          // _id: '$ratingsAverage',
          numTours: { $sum: 1 },
          numRatings: {
            $sum: '$ratingsQuantity',
          },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      //SORT BY AVG PRICE
      {
        //sort data by average price
        $sort: { avgPrice: 1 },
      },
      // {
      //   //Including everything EXCEPT 'EASY'
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    //

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
    //
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    //transform the parameter :year into a number
    // 2021
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        //the  "$unwind: '$startDates'" itself target startDates and get rid of its array and display only ONE
        $unwind: '$startDates',
      },
      {
        //match results that are only tours that are in 2021
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        //SORT BY GROUP like price, difficulty, ect. This is creating as many possibilities as possible but the id can never the exact
        $group: {
          //group all of them by exact month
          _id: { $month: '$startDates' },
          //add up total of tour that starts that month
          numTourStarts: { $sum: 1 },
          //create an array with their tour name
          tours: { $push: '$name' },
        },
      },
      {
        //aditional data to be displayed
        $addFields: {
          month: '$_id',
        },
      },
      {
        //0 or 1, this will determine if _id will be projected to the user
        $project: {
          _id: 0,
        },
      },
      {
        //month with most tours will be displayed first
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    //

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
    //
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
