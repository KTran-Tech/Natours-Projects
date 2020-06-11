// const fs = require('fs');
const Tour = require('../models/tourModel');
//To catch reject errors from async functions
const catchAsync = require('../utils/catchAsync');
//404 error handler, ect.
const AppError = require('../utils/appError');
//
const factory = require('./handlerFactory');

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

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  path: 'reviews',
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(
//   async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(
//       req.params.id
//     );

//     if (!tour) {
//       return next(
//         new AppError('No tour found with that ID', 404)
//       );
//     }

//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   }
// );

//

//

//

//To aggregate(add all the data together into one, to get an average or sum of everything)
exports.getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        //only select documents with ratings great than or equal to...
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        //SORT BY GROUP like price, difficulty, ect
        $group: {
          //aggregate all data to each one only with exact difficulty level or ratingsAverage
          //uppercase it also
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
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    //transform the parameter :year into a number
    // 2021
    const year = req.params.year * 1;
    //To aggregate(add all the data together into one, to get an average or sum of everything)
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
  }
);

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    //Original lat & Lng 45.34345345, 23.34234234
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400
        )
      );
    }

    //if radius is 'mi' then do first calculation(based on miles), else do based on km...
    const radius =
      unit === 'mi'
        ? distance / 3963.2
        : distance / 6378.1;

    //start location is within center sphere of user(their lng,lat is their location, and radius is how wide it spreads)
    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius],
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  }
);
