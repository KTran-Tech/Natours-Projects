const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

// to be able to use express methods
//app.use() is a command to tell express to use these specific tools
const app = express();

//

//

//

//setup for view engine called pug
app.set('view engine', 'pug');
//automatically set up path for destinated path
app.set('views', path.join(__dirname, 'views'));

// #) GLOBAL MIDDLEWARES

//Serving Static Files
app.use(
  //automatically set up path for destinated path
  //also makes it easier to call upon css and image files
  express.static(path.join(__dirname, 'public'))
);

//

//

//

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

//

//

//

// to be able to read the incoming (req object) as a JSON Object with a size limit of 10kb
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//

//

//Just Testing Middleware, not important
app.use((req, res, next) => {
  //initialize a property with value of current time in req object
  req.requestTime = new Date().toISOString();
  next();
});

//

//

// #) ROUTES
//To make this route in the web work

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
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
/*Note: The reason why we don't use catchAsync for some middleware
is because is the catchAsync function is only meant for Express Route
Handlers and are not pointing to our Schema document to begin with*/
app.use(globalErrorHandler);

module.exports = app;
