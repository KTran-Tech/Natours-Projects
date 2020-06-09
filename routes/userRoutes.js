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

router.get(
  '/me',
  userController.getMe,
  userController.getUser
);

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
