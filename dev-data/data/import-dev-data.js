const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

//

//

//BASIC SETUP

//  #) MongoDB
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
//use to get rid of some deprecation warnings
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

//BASIC SETUP

//

//

//

// To READ JSON FILE

//Also allows database to copy the data from file and use it as its own
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// To READ JSON FILE

//

// To IMPORT DATA INTO DATABASE

//creates an array of javascript object
const importData = async () => {
  try {
    //  validateBeforeSave: false, prevents validation errors so you could do changes to your data
    //
    await Tour.create(tours);
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Review.create(reviews);
    //
    console.log('Data was successfully loaded');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    //Delete All the data in database
    //
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    //
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  //
  process.exit();
  //
};

// To IMPORT DATA INTO DATABASE

//

//

//To manipulate Database
//First you have to '--delete' your current data in database and then '--import' in your newer data
//ex: node ./dev-data/data/import-dev-data.js --delete
//ex: node ./dev-data/data/import-dev-data.js --import
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//
