const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// #) ROUTES
const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    tourController.getAllTour
  );

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

//if there is a request to post(create) data to url, then respond with...
router
  .route('/')
  .get(
    authController.protect,
    tourController.getAllTour
  )
  .post(tourController.createTour);
//if there is a request to get(read) data of url, then respond with...
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
