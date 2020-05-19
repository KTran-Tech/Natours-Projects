const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

// //get the (root url) data by sending a req(request) to get back response
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });
// //post data to (root url) by sending a req(request) and get back response
// app.post('/', (req, res) => {
//   res.send('You can post this endpoint...');
// });

//

//without the JSON,parse the file is nothing but text, now its an array of objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//if there is a request to get(read) data of url, then respond with...
app.get('/api/v1/tours', (req, res) => {
  /*send back the response as a json object(specially for 'status')
because 'tours' is already one */
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  // console.log(req.params);

  //when multiply a string it will convert it into a number
  const id = req.params.id * 1;
  //loop through the array and if false then that element will be removed
  const tour = tours.find((element) => element.id === id);

  res.status(200).json({
    status: 'success',
    data:{
      tour
    }
  });
});

//if there is a request to post(create) data to url, then respond with...
app.post('/api/v1/tours', (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

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
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
