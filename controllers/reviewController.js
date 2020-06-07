const Review = require('../models/reviewModel.js');
//To catch reject errors from async functions
const catchAsync = require('../utils/catchAsync');
//To output user friendly error
const AppError = require('../utils/appError');

exports.createReview = catchAsync(
  async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  }
);

exports.getReview = catchAsync(
  async (req, res, next) => {
    const review = await Review.findById(
      req.params.id
    );

    if (!review) {
      return next(
        new AppError(
          'No review found with that ID',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        review,
      },
    });
  }
);

exports.getAllReviews = catchAsync(
  async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);
