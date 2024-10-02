const Tour = require('../models/tourModel');
const multer = require('multer')
const sharp = require('sharp')
const catchAsync = require('../utility/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utility/appError');

// The beginning of the photo section

/*
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users')
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
})
*/
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')){
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter 
})
exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next()

    // Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`)

    // Images
    req.body.images = []
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

        sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${filename}`)

        req.body.images.push(filename)
    }))
    next()
})

// The end of photo section

exports.getToursWithin = catchAsync(async(req, res, next) => {
    const {distance, latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')

    if (!lat || !lng){
        return next(new AppError('Please provide latitute and longitude in the format lat, lng.', 400))
    }

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    const tours = await Tour.find({
        startLocation: {
          $geoWithin: {
            $centerSphere: [
              [lat, lng],
              radius
            ]
          }
        }
      })
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async(req, res, next) => {
    const {latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')

    if (!lat || !lng){
        return next(new AppError('Please provide latitute and longitude in the format lat, lng.', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lat * 1, lng * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: 0.001,
                
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})

exports.getAll = factory.getAll(Tour)
exports.getId = factory.getOne(Tour, {path: 'reviews'})
exports.postTours = factory.createOne(Tour)
exports.updateID = factory.updateOne(Tour)
exports.deleteID = factory.deleteOne(Tour)
