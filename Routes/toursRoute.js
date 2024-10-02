const express = require('express');
const router = express.Router();
const toursController = require('../Controller/toursController');
const authController = require('../Controller/authController');
const reviewRouter = require('../Routes/reviewRoute');

router.use('/:tourId/reviews', reviewRouter)

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(toursController.getToursWithin)

router.route('/distances/:latlng/unit/:unit')
    .get(toursController.getDistances)

router.route('/')
    .get(toursController.getAll)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), toursController.postTours)

router.route('/:id')
    .get(toursController.getId)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'),toursController.resizeTourImages,toursController.uploadTourImages, toursController.deleteID)
    .patch(authController.protect, toursController.updateID)


module.exports = router;