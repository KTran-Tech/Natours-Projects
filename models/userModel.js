const crypto = require('crypto');
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
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valid email',
    ],
  },
  photo: String,
  //To become admin you have to change it directly in the DB
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    /*Makes sure password is never outputted to user through 
    getAllUsers or getUsers, its a security feature*/
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    /*Makes sure 'active' property is never outputted to user through 
    getAllUsers or getUsers*/
    select: false,
  },
});

//

//

//

//PRE-SAVE

//its a perfect time to manipulate data through middleware, when data is sent before being entirely saved
//invoke this function 'pre' before, 'save' saving the data to the database
/*Note: The reason why we don't use catchAsync for these middleware
is because is the catchAsync function is only meant for Express Route
Handlers and are not pointing to our Schema document to begin with*/
userSchema.pre('save', async function (next) {
  /*If password is not modified(empty password  string or not updated) then call next() middleware, else if it is
  modified(meaning a newly created document, with users password, or updated) 
  then encrypt the new password*/
  if (!this.isModified('password')) return next();
  //encrypt password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete password field
  //this works because the password is only a required INPUT not required data to be pushed to database
  this.passwordConfirm = undefined;
  next();
});

//its a perfect time to manipulate data through middleware, when data is sent before being entirely saved
//invoke this function 'pre' before, 'save' saving the data to the database
/*Note: The reason why we don't use catchAsync for these middleware
is because is the catchAsync function is only meant for Express Route
Handlers and are not pointing to our Schema document to begin with*/
userSchema.pre('save', function (next) {
  //if password has not been changed or the document has just been created, then move on to the next middleware and ignore this one
  if (!this.isModified('password') || this.isNew)
    return next();

  //sometimes the program lags behind a bit, so minus 1 second will help
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/*invoke this middleware before any 'find' commands like User.findByIdAndUpdate() is
done to the database */
/*Note: The reason why we don't use catchAsync for these middleware
is because is the catchAsync function is only meant for Express Route
Handlers and are not pointing to our Schema document to begin with*/
userSchema.pre(/^find/, function (next) {
  //Find only users that has "active" property set to true
  this.find({ active: { $ne: false } });
  next();
});

//

//

//INSTANCE METHODS

//these tools are built-in with mongoose so you could use anytime
//You have to specify to the schema that you are building a method
/*Note: The reason why we don't use catchAsync for these middleware
is because is the catchAsync function is only meant for Express Route
Handlers and are not pointing to our Schema document to begin with*/
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //returns true or false by comparing users password vs users database password
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};
//Tells you if passwod has been changed (by using dates)
//You have to specify to the schema that you are building a method
userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    //turns the date into readable iat, this is the initial data sent to the database
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  //false means password not changed
  return false;
};

//Tells if you did a password reset with new token
//You have to specify to the schema that you are building a method
userSchema.methods.createPasswordResetToken = function () {
  //the none encrypted
  const resetToken = crypto
    .randomBytes(32)
    .toString('hex');

  /*the encrypted, this encrypt the original token (resetToken) so it could be used for the modified schema
  and be sent to the database*/
  //change current property to this
  //'sha256' is the name of the algorithm
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //change current property to this
  this.passwordResetExpires =
    Date.now() + 10 * 60 * 1000;

  console.log({ resetToken }, this.passwordResetToken);

  //returns the unencrypted database
  return resetToken;
};

//To set up a user for the model?
const User = mongoose.model('User', userSchema);

module.exports = User;
