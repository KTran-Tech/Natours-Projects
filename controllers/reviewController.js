const Review = require('../models/reviewModel.js');
//To catch reject errors from async functions
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(
  async (req, res, next) => {
    let filter = {};

    if (req.params.tourId)
      filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

//

exports.setTourUserIds = (req, res, next) => {
  /*IF req.body.tour+user reference does not exist, e.g:
    {
      tour: ID
      user: ID
    }
    then collect the info from the param*/
  if (!req.body.tour)
    req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
