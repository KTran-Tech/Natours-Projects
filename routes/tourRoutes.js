const express = require('express');
const tourController = require('./../controllers/tourController');

// #) ROUTES
const router = express.Router();

//if there is a request to post(create) data to url, then respond with...
router
  .route('/')
  .get(tourController.getAllTour)
  .post(tourController.createTour);
//if there is a request to get(read) data of url, then respond with...
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
