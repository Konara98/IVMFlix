const mongoose = require('mongoose');
const fs = require('fs');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        unique: true,
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
    },
    totalRatings: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release Year is required!']
    },
    releaseDate: {
        type: Date,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, 'Genres is required!']
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

const Movie = mongoose.model('movie', movieSchema);

module.exports = Movie;