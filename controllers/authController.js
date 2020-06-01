//util already comes built-in with node
const { promisify } = require('util');
//Like a passport used for verification that come built-in already
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.signup = catchAsync(
  async (req, res, next) => {
    //the create() will also add the data to the database
    //pass in 'req.body' data to (User)schema and create new user
    //this is a security improvement because it allows user to only enter these specific data
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.password,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

exports.login = catchAsync(
  async (req, res, next) => {
    const { email, password } = req.body;

    //1) Check if email and password exist
    if (!email || !password) {
      //it is important to call a return so that the login function finishes right away
      //call upon next middleware
      return next(
        new AppError(
          'Please provide email and password!',
          400
        )
      );
    }
    //2) Check if user exists && password is correct from database
    const user = await User.findOne({
      email,
    }).select('+password');

    if (
      !user ||
      !(await user.correctPassword(
        password,
        user.password
      ))
    ) {
      //it is important to call a return so that the login function finishes right away
      return next(
        new AppError(
          'Incorrect email or password',
          401
        )
      );
    }

    //3) If everything works, send token to client
    const token = signToken(user._id);
    //
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

exports.protect = catchAsync(
  async (req, res, next) => {
    // 1) Get token and check if its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        'Bearer'
      )
    ) {
      // .split('') will will remove the space and create an array of the two
      token = req.headers.authorization.split(
        ' '
      )[1];
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access',
          401
        )
      );
    }
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    console.log(decoded);
    // 3) Check if user still exist

    // 4) Check if user changed password after the token was issued

    next();
  }
);
