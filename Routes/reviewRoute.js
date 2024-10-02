const express = require('express');
const authController = require('../Controller/authController')
const reviewController = require('../Controller/reviewController')

const router = express.Router({mergeParams: true});

router.use(authController.protect)

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'), reviewController.setToUserIds, reviewController.createReview)


router.route('/:id')
    .get(reviewController.getReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    

module.exports = router