const mongoose = require('mongoose');
const fs = require('fs');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        unique: true,
        maxlength: [100, 'Movie name must not have more than 100 characters'],
        minlength: [3, 'Movie name must not have less than 3 characters'],
        trim: true,
        validate: [validator.isAlpha, 'Name must be only contain alphabets!']
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
                return value>=1 && value <=10;
            },
            message: 'Ratings ({VALUE}) should be above 1 and below 10'
        }
    },
    totalRating: {
        type: Number,
        max: [1000, 'Total ratings must be 1000 or below!'],
        min: [1, 'Total ratings must be 1 or above!']
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release Year is required!']
    },
    releaseDate: {
        type: Date
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
            values: ["Action", "Adventure", "Sci-Fi", "Thriller", "Crime", "Drama", "Comedy", "Romance", "Biography"],
            message: 'This genre does not exist'
        }
    },
    directors: {
        type: [String],
        required: [true, 'Directors is required!']
    },
    coverImage: {
        type: String,
        required: [true, 'Cover Image is required!']
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
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

movieSchema.virtual('durationInHours').get(function(){
    return this.duration/60;
})

//Pre hook: exceute before the document is saved in DB
//.save() or .create() will work
movieSchema.pre('save', function(next){
    this.createdBy = 'Lakshitha';
    next();
})

//Post hook: exceute after the document is saved in DB
movieSchema.post('save', function(doc, next){
    const context = `A new movie document with ${doc.name} has been created by ${doc.createdBy}\n`
    fs.appendFileSync('./Logs/log.txt', context, (err) => {
        console.log(err.message);
    });
    next();
})

//Pre hook: exceute before the query object is return
movieSchema.pre('find', function(next){
    this.find({releaseDate: {$lte: Date.now()}});
    next();
})

//Pre hook: exceute before the aggregate object is return
movieSchema.pre('aggregate', function(next){
    this.pipeline().unshift({$match: {releaseDate: {$lte: new Date()}}});
    next();
})

const Movie = mongoose.model('movie', movieSchema);

module.exports = Movie;