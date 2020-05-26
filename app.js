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
  //initialize a property with value of current time in req object
  req.requestTime = new Date().toISOString();
  next();
});

// #) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//for all routes, '*' means everything
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  const err = new Error(
    `Can't find ${req.originalUrl} on this server!`
  );
  err.status = 'fail';
  err.statusCode = 404;
  //if you pass in something it will automatically know its an error
  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
