const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARES

//
app.use(morgan('dev'));
// recognize the incoming Request Object as a JSON Object
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  //initialize a property with value of current time in req object
  req.requestTime = new Date().toISOString();
  next();
});

//without the JSON,parse the file is nothing but text, now its an array of objects
const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/dev-data/data/tours-simple.json`
  )
);

//

//

// 2) ROUTE HANDLERS

const getAllTour = (req, res) => {
  console.log(req.requestTime);
  /*send back the response as a json object(specially for 'status')
  because 'tours' is already one */
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

getTour = (req, res) => {
  // console.log(req.params);

  //when multiply a string it will convert it into a number
  const id = req.params.id * 1;
  //loop through the array and if false then that element will be removed
  const tour = tours.find(
    (element) => element.id === id
  );

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign(
    { id: newId },
    req.body
  );

  //push new object into array 'tours' which can be used to update
  tours.push(newTour);
  //overwritting old file with new file
  //need to turn object into json file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      //send the newly created json object as a response
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES

//if there is a request to post(create) data to url, then respond with...
app
  .route('/api/v1/tours')
  .get(getAllTour)
  .post(createTour);
//if there is a request to get(read) data of url, then respond with...
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 4) START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
