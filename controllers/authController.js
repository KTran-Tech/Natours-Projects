//util already comes built-in with node
const { promisify } = require('util');
//Like a passport used for verification that come built-in already
const jwt = require('jsonwebtoken');
//This serves as the database access point
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
      passwordChangedAt:
        req.body.passwordChangedAt,
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

    //this is what you ONLY return back to user in JSON file
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

//get all tours but checks if token is valid
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
    //if the token doesnt not exist
    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access',
          401
        )
      );
    }
    // 2) Verifies users token vs the server's JWT_SECRET (COMPARING THEM)
    //if verification fails then the program stops and throws and error
    //if successful, it logs the destructured token
    /* { id: '5ed5786cf61bae4d4ad723b6',
        iat: 1591048302,
        exp: 1598824302 } */
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exist
    //grabs the VERIFIED user id from decoded, this will always be true because promisify makes sure...
    const currentUser = await User.findById(
      decoded.id
    );
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to the token no longer exist.',
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    //iat stands for token 'ISSUED AT'
    if (
      currentUser.changedPasswordAfter(
        decoded.iat
      )
    ) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    //If none of the above is true, then grant access to protected route down below
    req.user = currentUser;
    next();
  }
);

//creates an array from the parameter, and RESTRICT access only to specific roles
exports.restrict = (...roles) => {
  //returns a middleware function that has access to the roles parameter
  return (req, res, next) => {
    // roles ['admin', 'lead-guide'], if role="user" then you don't have permission
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perfom this action',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // 1) Get users req.email and find one similar in database
    //"User" refers to the database
    const user = await User.findOne({
      email: req.body.email,
    });
    //if users email in database does not exist, error message
    if (!user) {
      return next(
        new AppError(
          'There is no user with email address.',
          404
        )
      );
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    //the resetToken function changes the schema data, and to save that you have to save it here.
    //validateBeforeSave() ---> deactivate all validators before saving data to database
    await user.save({
      validateBeforeSave: false,
    });

    // 3) Send it to user's email

    //This is the url for resetting the password
    //protocal means "http/https", host means domain name
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    //This is the message sent privately to users email containing the reset url
    const message = `Forgot your password? Submit a PATCH request with your 
    new password and passwordConirm to: ${resetURL}\nIf you didn't 
    forget your password, pleae ignore this email!`;

    //Pass info into the function to send token and message to users email
    await sendEmail({
      email: user.email,
      subject:
        'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  }
);

exports.resetPassword = (req, res, next) => {};
