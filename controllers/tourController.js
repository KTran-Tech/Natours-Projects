
const fs = require('fs');

//without the JSON,parse the file is nothing but text, now its an array of objects
const tours = JSON.parse(
    fs.readFileSync(
      `${__dirname}/../dev-data/data/tours-simple.json`
    )
  );
  
  // #) ROUTE HANDLERS
  
  exports.getAllTour = (req, res) => {
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
  
  exports.getTour = (req, res) => {
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
  
  exports.createTour = (req, res) => {
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
  
  exports.updateTour = (req, res) => {
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
  
  exports.deleteTour = (req, res) => {
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