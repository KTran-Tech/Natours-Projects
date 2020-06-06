const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// to be able to use express methods
//app.use() is a command to tell express to use these specific tools
const app = express();

// #) GLOBAL MIDDLEWARES
//SET SECURITY HTTP HEADERS
app.use(helmet());

// DEVELOPMENT LOGGING
//if the current environment is in development then...
if (process.env.NODE_ENV === 'development') {
  //allows you to see request data right in the console
  //e.g: GET /api/v1/tours 200 24.046 ms - 8747
  app.use(morgan('dev'));
}
//LIMIT REQUEST FROM SAME API
//limit request from user for routing
//only 100 request per hour, if too many send back error
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message:
    'Too many request from this IP, please try again in an hour!',
});

//use this tool when route starts with...
app.use('/api', limiter);

// to be able to read the incoming (req object) as a JSON Object with a size limit of 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));

//Just Testing Middleware, not important
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

//for all other routes, '*' means everything
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
