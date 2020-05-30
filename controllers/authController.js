const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(
  async (req, res, next) => {
    //the create() will also add the data to the database
    //pass in 'req.body' data to (User)schema and create new user
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  }
);
