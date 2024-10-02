const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    slug: String,
    duration: {
        type: Number,
        required: true,
    },
    maxGroupSize: Number,
    difficulty : {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'advanced']
    },
    ratingsAverage: {
        type: Number,
        validate: {
            validator: function(value) {
                return 0 <= value || value <= 5
            }
        },
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: Number,
    price: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    crearetedAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        adress: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            adress: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
);

toursSchema.index({ startLocation: '2dsphere' })

toursSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
})

//Virtual populate
toursSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

toursSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true})
    next()
})

toursSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordCangedAt'
    })

    next()
})

/*toursSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} miliseconds!`)
    next()
})

toursSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}})
    console.log(this.pipeline())
    next()
})*/

const Tour = mongoose.model("Tour", toursSchema);
module.exports = Tour;