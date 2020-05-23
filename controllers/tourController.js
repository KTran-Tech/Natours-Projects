// const fs = require('fs');
const Tour = require('../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

//

//

//

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
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
    // const query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(
      JSON.parse(queryStr)
    );

    //"this" is the entire object
    return this;
  }

  sort() {
    //continue chaining the change we did to query
    //if request.query has a sort property,
    if (this.queryString.sort) {
      //select only that specific property and nothing after it
      //"sort=price,ratingsAverage" we sort with price first
      const sortBy = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortBy);
      //"sort=price ratingsAverage"
    } else {
      //created at specific time sort
      this.query = this.query.sort('-createdAt');
    }

    //"this" is the entire object
    return this;
  }

  limitFields() {
    // 3) Field limiting
    //field limiting means displaying only specific properties
    if (this.queryString.fields) {
      //select only that specific property and nothing after it
      //output "name duration difficulty price"
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      //'select' mean only output the fields and with logic from query
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    //"this" is the entire object
    return this;
  }

  paginate() {
    // 4) Pagination
    //a nice way to turn string into a number
    //if there is no page info then default to 1 or 100
    const page = this.queryString.page * 1 || 1;
    const limit =
      this.queryString.limit * 1 || 100;
    //formula for page skipping, no need to memorize
    const skip = (page - 1) * limit;
    //'limit' is the amount of results you want
    this.query = this.query
      .skip(skip)
      .limit(limit);

    //"this" is the entire object
    return this;
  }
}

// //without the JSON,parse the file is nothing but text, now its an array of objects
// const tours = JSON.parse(
//   fs.readFileSync(
//     `${__dirname}/../dev-data/data/tours-simple.json`
//   )
// );

//

//

//

//

//

exports.getAllTour = async (req, res) => {
  try {
    //EXECUTE QUERY
    //Literally passing in the method .Find()
    const features = new APIFeatures(
      Tour.find(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    //

    //

    //

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
