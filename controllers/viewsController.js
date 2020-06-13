const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(
  async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    //goes into views folder and render base.pug
    //also make argument data publicly available in pug template
    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  }
);

//

//

exports.getTour = catchAsync(
  async (req, res, next) => {
    //It is slug(random title) because we don't know the tour's ID is and so we just look for any tours with matching slug
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({
      slug: req.params.slug,
    }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });

    //goes into views folder and render base.pug
    //also make argument data publicly available in pug template
    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  }
);
