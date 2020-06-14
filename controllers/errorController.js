const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(
    /(["'])(?:(?=(\\?))\2.)*?\1/
  )[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //turns object into an array using Object.value() and store it there
  const errors = Object.values(err.errors).map(
    (element) => element.message
  );

  const message = `Invalid input data. ${errors.join(
    '. '
  )}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError(
    'Invalid token. Please log in again!',
    401
  );

const handleJWTExpiredError = () =>
  new AppError(
    'Your token has expired! Please log in again.',
    401
  );

//

//

//

// DEVELOPMENT PRODUCTION
const sendErrorDev = (err, res) => {
  //pass in the error statusCode (e.g 404, 400, 200, ect)
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//PRODUCTION ERROR FOR USER
const sendErrorProd = (err, res) => {
  //user friendly error to client, operational error like wrong routing ect
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //for programmer, dont leak error detail to user
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    //2)Generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

//This is the global error handler that is referred to from the app.js
//By default all errors go here
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError')
      error = handleCastErrorDB(error);
    if (error.code === 11000)
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJWTError();
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
