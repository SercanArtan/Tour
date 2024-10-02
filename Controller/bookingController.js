const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const catchAsync = require('../utility/catchAsync')
const factory = require('../Controller/handlerFactory')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID)
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.id}&user=${req.user.id}&price${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.body.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    })

    next()
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const {tour, user, price} = req.query

    if (!tour && !user && !price) return next()

    await Booking.create({tour, user, price})

    res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooing = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)