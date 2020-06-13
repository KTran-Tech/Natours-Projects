const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// Overview/Home Page
router.get('/', viewsController.getOverview);

router.get('/tour/:slug', viewsController.getTour);

module.exports = router;
