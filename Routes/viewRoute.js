const express = require('express')
const viewController = require('../Controller/viewController')
const authController = require('../Controller/authController')
const bookingController = require('../Controller/bookingController')

const router = express.Router()

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug',authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/me',authController.protect, viewController.getAccount)
router.get('/my-tours',authController.protect, viewController.createBookingCheckout)

module.exports = router

