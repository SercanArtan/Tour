const path = require('path')
const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tours = require('./Routes/toursRoute');
const users = require('./Routes/userRoute');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const reviews = require('./Routes/reviewRoute')
const viewRoute = require('./Routes/viewRoute')
const bookingRoute = require('./Routes/bookingRoute')
const cookieParser = require('cookie-parser');



dotenv.config();
mongoose.connect(process.env.MONGODB_URL);

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json());

app.use(helmet());

const limiter = rateLimit({
    max: 100,
    windows: 60 * 60 * 1000,
    messege: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter);
app.use(cookieParser())
// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())


app.use("/", viewRoute);
app.use("/v1/api/tours", tours);
app.use("/v1/api/users", users);
app.use("/v1/api/reviews", reviews);
app.use("/v1/api/bookings", bookingRoute);

app.listen(3000, () => {
    console.log("server is running http://localhost:3000");
});