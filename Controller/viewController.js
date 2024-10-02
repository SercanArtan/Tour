const Tour = require('../models/tourModel')
const catchAsync = require('../utility/catchAsync')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')

exports.getOverview = catchAsync(async (req, res) => {
    // 1) Get tour data from collections
    const tours = await Tour.find()
    // 2) Build template

    // 3) Render that template usig tour data from 1)

    res.status(200).render('overview', {
        title: 'All Tours',
        tours: tours
    })
})

exports.getTour = catchAsync(async (req, res) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    // 2) Build template

    // 3) Render template using data from 1)
    res.status(200).render('tour', {
        title: `${tour.title} Tour`,
        tour
    })
})

exports.getLoginForm = catchAsync(async (req, res) => {
    res.status(200).render('login', {
        title: 'Loging into your accounr'
    })
})

exports.getAccount = (req, res) => {
    res.status(200).render('accout', {
        title: 'Your account'
    })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({user: req.user.id})

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour)
    const tours = await Tour.find({_id: {$in: tourIDs}})

    res.status(200).render('overview', {
        title: 'My tours',
        tours
    })
})