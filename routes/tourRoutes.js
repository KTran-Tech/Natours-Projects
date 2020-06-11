const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// #) ROUTES
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    tourController.getAllTours
  );

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo(
      'admin',
      'lead-guide',
      'guide'
    ),
    tourController.getMonthlyPlan
  );

//

router
  .route(
    '/tours-within/:distance/center/:latlng/unit/:unit'
  )
  .get(tourController.getToursWithin);

//

//if there is a request to post(create) data to url, then respond with...
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
//if there is a request to get(read) data of url, then respond with...
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
