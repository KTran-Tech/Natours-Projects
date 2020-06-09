const catchAsync = require('../utils/catchAsync');
//404 error handler, ect.
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

//FACTORY FUNCTIONS

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(
      req.params.id
    );

    if (!doc) {
      //return so that we dont output two responses and exit
      return next(
        new AppError(
          'No document found with that ID',
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//

//

//

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //"new: true" its to allow you to return updated document

    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new AppError(
          'No document found with that ID',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//

//

//

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //create a new request body object data that usually comes with POST
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//

//

//

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //
    // const doc = await Model.findById(req.params.id).populate('reviews');
    //
    //Not awaiting the variable right away so you could manipulate it
    let query = Model.findById(req.params.id);
    //You can think of populate() like the spread operation ...object spreading out the data from that ID referred name
    //If populate command exist, e.g {path: 'reviews'}, then populate query
    if (popOptions) query = query.populate(popOptions);
    // start asynchronous process
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          'No document found with that ID',
          404
        )
      );
    }

    /*send back the response as a json object(specially for 'status')
        because 'docs' is already one */
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//

//

//

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //EXECUTE QUERY

    //

    //To allow for nested GET reviews on tour
    let filter = {};

    if (req.params.tourId)
      filter = { tour: req.params.tourId };

    //

    //Literally passing in the method .Find() to constructor
    const features = new APIFeatures(
      Model.find(filter),
      req.query
    ) //the reason for why chaining work is because all of the methods returns "this"
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //

    const doc = await features.query;

    // console.log(req.query);
    // console.log(req.query, queryObj);

    // const query = await Model.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    /*send back the response as a json object(specially for 'status')
        because 'Model' is already one */
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
