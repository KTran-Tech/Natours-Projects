const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: [1, 'Ratings must be above 1.0'],
      max: [5, 'Ratings must be below 5.0'],
    },
    //Tells you what tour the review belongs to
    tour: {
      //special referencing command
      type: mongoose.Schema.ObjectId,
      //referencing the name. e.g "const Tour = mongoose.model('Tour', tourSchema);" of the Tour Schema Model
      ref: 'Tour',
      required: [
        true,
        'Review must belong to a tour.',
      ],
    },
    //Tells you which user left the review
    user: {
      type: mongoose.Schema.ObjectId,
      //referencing the name. e.g "const Tour = mongoose.model('Tour', tourSchema);" of the Tour Schema Model
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  //Virtuals have additional attribute but it does not get inserted into DB. So this will make it visible to us in the output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//PRE

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

//

//

//pass in specific tour Id given by user
reviewSchema.statics.calcAverageRatings = async function (
  tourId
) {
  //storing the calculation in "stats"
  const stats = await this.aggregate([
    {
      //not suppose to show in console.log
      //search and match that specific tour Id
      $match: { tour: tourId },
    },
    {
      $group: {
        //_id = "tour Id passed in by user"
        _id: '$tour',
        nRating: { $sum: 1 },
        //find the average rating of that tour
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

//

//

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
