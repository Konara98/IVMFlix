const mongoose = require('mongoose');
const validator = require('validator');

const videosSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        unique: true,
        maxlength: [100, 'Video name must not have more than 100 characters'],
        minlength: [3, 'Video name must not have less than 3 characters'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required!'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required!'],
    },
    ratings: {
        type: Number,
        validate: {
            validator: function(value){
                return value >=1 && value <=10
            },
            message: 'Ratings ({VALUE}) should be above 1 and below 10'
        }
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release Year is required!']
    },
    releaseDate: {
        type: Date,
        required: [true, 'Release Date is required!']
    },
    createdDate: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, 'Genres is required!'],
        enum: {
            values: ["Pop music", "Rock", "Electronic music", "Hip hop", "Soul music", "Breakbeat", "Rapping", "Popular music", "Disco", "Dance", "Synthwave", "R&B"],
            message: 'This genre does not exist'
        }
    },
    directors: {
        type: [String],
        required: [true, 'Directors is required!']
    },
    coverImage: {
        type: String,
        required: [true, 'Cover Image is required!'],
        validate: [validator.isURL, 'Cover Image must be a URL!']
    },
    actors: {
        type: [String],
        required: [true, 'Actors is required!']
    },
    price: {
        type: Number,
        required: [true, 'Price is required!']
    },
    createdBy: {
        type: String
    }
})

//Pre hook: exceute before the query object is return
videosSchema.pre('find', function(next){
    this.find({releaseDate: {$lte: Date.now()}});
    next();
})

//Pre hook: exceute before the aggregate object is return
videosSchema.pre('aggregate', function(next){
    this.pipeline().unshift({$match: {releaseDate: {$lte: new Date()}}});
    next();
})

const Video = mongoose.model('video', videosSchema);

module.exports = Video;