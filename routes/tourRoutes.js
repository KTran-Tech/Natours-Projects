const express = require('express');
const tourController = require('../controllers/tourController');

// #) ROUTES
const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    tourController.getAllTour
  );

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
