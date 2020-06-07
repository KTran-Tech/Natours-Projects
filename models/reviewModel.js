const mongoose = require('mongoose');

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
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        //referencing the name. e.g "const Tour = mongoose.model('Tour', tourSchema);" of the Tour Schema Model
        ref: 'Tour',
        required: [
          true,
          'Review must belong to a tour.',
        ],
      },
    ],
    //Tells you which user left the review
    user: [
      {
        type: mongoose.Schema.ObjectId,
        //referencing the name. e.g "const Tour = mongoose.model('Tour', tourSchema);" of the Tour Schema Model
        ref: 'User',
        required: [
          true,
          'Review must belong to a user',
        ],
      },
    ],
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
