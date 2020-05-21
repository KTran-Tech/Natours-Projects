const mongoose = require('mongoose');

//schema(outline/model)
//specify a schema for our data
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price'],
  },
});

//collection name and schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
