const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
