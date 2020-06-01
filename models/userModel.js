const mongoose = require('mongoose');
//Powerful ToolKit to Validate
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'A  must have a '],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valid email',
    ],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'A  must have a password Confirmation',
    ],
    validate: {
      //Will only work on Create() and Save()
      //pass the property for this object and check if...
      validator: function (element) {
        return element === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

//its a perfect time to manipulate data through middleware, when data is sent
//invoke this function 'pre' before, 'save' saving the data to the database
userSchema.pre('save', async function (next) {
  //if password has not been modified then call next middleware
  if (!this.isModified('password')) return next();
  //encrypt password with cost of 12
  this.password = await bcrypt.hash(
    this.password,
    12
  );
  //delete password field
  //this works because the password is only a required INPUT not required data to be pushed to database
  this.passwordConfirm = undefined;
  next();
});

//these tools are built-in with mongoose so you could use anytime
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //returns true or false
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    console(this.passwordChangedAt, JWTTimestamp);
  }
  return false;
};

//To set up a user for the model?
const User = mongoose.model('User', userSchema);

module.exports = User;
