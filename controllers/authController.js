const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if email and password exist
  if (!email || !password) {
    //call upon next middleware
    next(
      new AppError(
        'Please provide email and password!',
        400
      )
    );
  }
  //3) If everything works, send token to client
  const token = '';
  res.status(200).json({
    status: 'success',
    token,
  });
};
