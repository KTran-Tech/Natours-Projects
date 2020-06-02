//util already comes built-in with node
const { promisify } = require('util');
//Like a passport used for verification that come built-in already
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //the create() will also add the data to the database
  //pass in 'req.body' data to (User)schema and create new user
  //this is a security improvement because it allows user to only enter these specific data
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.password,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  //this is what you ONLY return back to user in JSON file
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if email and password exist
  if (!email || !password) {
    //it is important to call a return so that the login function finishes right away
    //call upon next middleware
    return next(new AppError('Please provide email and password!', 400));
  }
  //2) Check if user exists && password is correct from database
  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    //it is important to call a return so that the login function finishes right away
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) If everything works, send token to client
  const token = signToken(user._id);

  //this is what you ONLY return back to user in JSON file
  res.status(200).json({
    status: 'success',
    token,
  });
});

//get all tours
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // .split('') will will remove the space and create an array of the two
    token = req.headers.authorization.split(' ')[1];
  }
  //if the token doesnt not exist
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  // 2) Verifies users token vs the server's JWT_SECRET (COMPARING THEM)
  //if verification fails then the program stops and throws and error
  //if successful, it logs the destructured token
  /* { id: '5ed5786cf61bae4d4ad723b6',
        iat: 1591048302,
        exp: 1598824302 } */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  //grabs the VERIFIED user id from decoded, this will always be true because promisify makes sure...
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token no longer exist.', 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  //iat stands for token 'ISSUED AT'
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  //If none of the above is true, then grant access to protected route down below
  req.user = currentUser;
  next();
});
