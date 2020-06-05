const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//

//

// Functions and Methods 


//

//

//

// #) ROUTER HANDLERS
exports.getAllUsers = catchAsync(
  async (req, res, next) => {
    //Collect all user from database
    const users = await User.find();

    // Send Response
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

//

//

// Update User Data

exports.updateMe = catchAsync(
  async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (
      req.body.password ||
      req.body.passwordConfirm
    ) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }

    // 2) Update user document
    const filteredBody = filterObj(
      req.body,
      'name',
      'email'
    );
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    //Reserved for more sensitive data like password, so use findByIdAndUpdate() instead
    // user.name = 'Jonas';
    // await user.save();

    res.status(200).json({
      status: 'success',
    });
  }
);

//

//

//
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
