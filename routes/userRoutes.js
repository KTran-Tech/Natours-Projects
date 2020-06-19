const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// #) ROUTERS
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post(
  '/forgotPassword',
  authController.forgotPassword
);
router.patch(
  '/resetPassword/:token',
  authController.resetPassword
);

//

//ANYTHING that comes AFTER this point will have this middleware applied
router.use(authController.protect);
//ANYTHING that comes AFTER this point will have this middleware applied

//

router.patch(
  '/updateMyPassword',
  authController.updatePassword
);

//set param ID to current logged in user Id so they don't have to do it manually 
//get user along with their info based on ID
//This is so that they will have to get their info to see what they want to change/update
router.get(
  '/me',
  userController.getMe,
  userController.getUser
);

//After they know what they want to change they call upon this route
router.patch('/updateMe', userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

//

//ANYTHING that comes AFTER this point will have this middleware applied
router.use(authController.restrictTo('admin'));
//ANYTHING that comes AFTER this point will have this middleware applied

//

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
