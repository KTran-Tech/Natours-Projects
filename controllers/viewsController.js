const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(
  async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build Template

    // 3) Render that template using tour data from 1

    //goes into views folder and render base.pug
    //also make argument data publicly available in pug template
    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  }
);

exports.getTour = (req, res) => {
  //goes into views folder and render base.pug
  //also make argument data publicly available in pug template
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
};
