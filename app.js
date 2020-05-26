const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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

//

//

//

//for all routes, '*' means everything
app.all('*', (req, res, next) => {
  //if you pass in something it will automatically know its an error
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

//if anyone of the valid routes return an error then it will have to be redirected to this
app.use(globalErrorHandler);

module.exports = app;
