const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(
      req.params.id
    );

    if (!doc) {
      /* Params ID have a strict length that you cannot violate, e.g adding an additonal character (causing it to
      no longer be considered an ID), or else it would throw an error, 
      but if you were to change one of its character to something else then that ID
      would still be an ID but an invalid nonexistent ID throwing the error below */
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
