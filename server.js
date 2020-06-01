const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(
    'UNCAUGHT EXCEPTION! 💥 SHUTTING DOWN...'
  );
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

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
  .then(() =>
    console.log('DB connection successful')
  );

//

// #) START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});

//Rejections from common promises
process.on('unhandledRejection', (err) => {
  console.log(
    'UNCAUGHT EXCEPTION! 💥 SHUTTING DOWN...'
  );
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
