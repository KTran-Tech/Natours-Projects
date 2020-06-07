const mongoose = require('mongoose');
// A slug is a unique identifier for the resource of the url
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');
//schema(outline/model)
//specify a schema for our data
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      //unique will cause an error if we have a duplicate name
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equal then 10 characters',
      ],
      minlength: [
        10,
        'A tour name must have more or equal then 40 characters',
      ],
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain characters',
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [
        true,
        'A tour must have a group size',
      ],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      //Give you the options of only these required field
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1.0'],
      max: [5, 'Ratings must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      //this is a custom validaton
      validate: {
        validator: function (val) {
          //this only points to current doc on NEW document creation and not .update()
          //returns true or false
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) should be below regular price ',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [
        true,
        'A tour must have a description',
      ],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [
        true,
        'A tour must have a cover image',
      ],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      //this means that this will never be displayed to the user
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    //
    //
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        //Give you the options of only these required field
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //Referenced DataSet through Object Id
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        //referencing the name. e.g "const Tour = mongoose.model('Tour', tourSchema);""
        ref: 'User',
      },
    ],
  },
  //
  //Virtuals have additional attribute but it does not get inserted into DB. So this will make it visible to us in the output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//this is adding on a virtual type with extra data to the tourSchema
//Here we can do the calculation right in the model itself
tourSchema.virtual('durationWeeks').get(function () {
  //if you wnat to use the "this" keyword then always use the normal function
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE, 'pre' means to happen before saving the document
//'this' selects the current document, e.g a new document submitted to the database by user(.create() and .save() only)
//Note, only this regular function can you use 'this'
tourSchema.pre('save', function (next) {
  //'this.name' is based on the schema name
  //this.slug pointing to the currently being saved document
  this.slug = slugify(this.name, { lower: true });
  next();
});
//DOCUMENT MIDDLEWARE, 'post' means to happen after saving the document
// tourSchema.post('save', function (doc, next) {});

//Before ANY 'find' query is invoke, eg.Tour.findById(), do this
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

//

//----------------------------//
//THIS IS EMBEDDING DOCUMENTS
// tourSchema.pre('save', async function (next) {
//   //For every item in schema 'this.guides' findById(element property name) in User(database) with new array populated with the newer data
//   const guidesPromises = this.guides.map(
//     async (element) => await User.findById(element)
//   );
//   //Promise.all() is useful anytime you have more than one promise
//   //If any of the passed promises are rejected, then this method rejects the value of that promise
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
//----------------------------//

//

//

//

// QUERY MIDDLEWARE
//'find' pointing to the current query
// /^find/ mean anything that starts with 'find'
tourSchema.pre(/^find/, function (next) {
  //Display only the SectretTours that are not set to 'true' and dont display
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Query took ${
      Date.now() - this.start
    } milliseconds!`
  );
  next();
});

//AGGREGATION MIDDLEWARE
//points to aggregation object
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  console.log(this.pipeline());

  next();
});

//collection name and schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
