const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// #) MIDDLEWARES

//
//allows you to see request data right in the console
app.use(morgan('dev'));
// recognize the incoming Request Object as a JSON Object
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  //initialize a property with value of current time in req object
  req.requestTime = new Date().toISOString();
  next();
});

// #) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
