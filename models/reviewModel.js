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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    //Tells you what tour the review belongs to
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        //referencing the name. e.g "const Tour = mongoose.model('Tour', tourSchema);""
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
        //referencing the name. e.g "const Tour = mongoose.model('Tour', tourSchema);""
        ref: 'User',
        required: [
          true,
          'Review must belong to a user',
        ],
      },
    ],
  },
  //Virtuals have additional attribute but it does not get inserted into DB. So this will make it visible to us in the output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
