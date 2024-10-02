const mongoose = require('mongoose');
const Tour = require('../models/tourModel')
const uniqueValidator = require('mongoose-unique-validator');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// It does not work, no unique
//reviewSchema.index({tour: 1, user:1}, {unique: true})

reviewSchema.pre(/^find/, function(next) {
    /*this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    })*/

    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})

// LEARN!!!!!!
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ])
    if (stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        }
        )
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 0
        }
        )
    }

}

reviewSchema.post('save', function() {
    //Review.calcAverageRatings(this.tour) but we cannot use it bc Review is not yet defined
    // So constructor is helpful
    this.constructor.calcAverageRatings(this.tour)
})

//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // the clone creates copy of the query thanks to that, The error that
    // the query was already executed does NOT exist
    this.r = await this.clone().findOne();
    next()
})

reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

