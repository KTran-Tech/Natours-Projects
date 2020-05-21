const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// #) MIDDLEWARES

//if the current environment is in development then...
if (process.env.NODE_ENV === 'development') {
  //allows you to see request data right in the console
  //e.g: GET /api/v1/tours 200 24.046 ms - 8747
  app.use(morgan('dev'));
}

// recognize the incoming Request Object as a JSON Object
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

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
