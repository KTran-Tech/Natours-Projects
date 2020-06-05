//this is to encrypt your unencrypted token
const crypto = require('crypto');
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
      passwordConfirm: req.body.passwordConfirm,
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
exports.restrictTo = (...roles) => {
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

//when user forgets password and enters data into req.body to get it back
exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // 1) Get users req.email and find one similar in database
    //"User" references the database
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
    //The resetToken only modifies the schema document data, you have to have it to the database
    await user.save({
      //validateBeforeSave() ---> deactivate all validators before saving data to database
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
    new password and passwordConfirm to: ${resetURL}\nIf you didn't 
    forget your password, please ignore this email!`;

    try {
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
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      //The commands above only modifies the schema document data, you have to have it to the database
      await user.save({
        //validateBeforeSave() ---> deactivate all validators before saving data to database
        validateBeforeSave: false,
      });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      );
    }
  }
);

//When the user gets the token from their email and enters it
exports.resetPassword = catchAsync(
  async (req, res, next) => {
    // 1) Get user based on the token

    //updates the parameters "email received unencrypted token" from the current route to be encrypted
    //'sha256' is the name of the algorithm
    //Encrypted
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    //"User" references the database
    //finds to see if the same encrypted token exists in the database
    //Encrypted
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired and user still exists in the database, set the new password

    //if the data cease to be false, error message
    if (!user) {
      return next(
        new AppError(
          'Token is invalid or has expired',
          400
        )
      );
    }
    //officially modify the old password to the new reset password and other properties
    user.password = req.body.password;
    user.passwordConfirm =
      req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //The commands above only modifies the schema document data, you have to save it
    await user.save();
    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, sends new JWT

    //If everything works, send token to client
    const token = signToken(user._id);

    //this is what you ONLY return back to user in JSON file
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

//

//

//

exports.updatePassword = (req, res, next) => {
  // 1) Get user from collection
  // 2) Check if POSTed current password is correct
  // 3) If so, update password
  // 4) Log user in, send JWT
};
