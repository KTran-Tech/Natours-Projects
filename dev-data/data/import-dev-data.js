const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Tour = require('../../models/tourModel');
//

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

//

// To READ JSON FILE
//Also allows database to copy the data from file and use it as its own
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

// To IMPORT DATA INTO DATABASE

//creates an array of javascript object
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data was successfully loaded');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//To manipulate Database
//First you have to '--delete' your current data in database and then '--import' in your newer data
//ex: node ./dev-data/data/import-dev-data.js --delete
//ex: node ./dev-data/data/import-dev-data.js --import
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
