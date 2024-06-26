const Movie = require('./../Models/movieModel');
const ApiFeatures = require('./../Utils/ApiFeatures');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const CustomError = require('./../Utils/CustomError');

exports.getHighestRatedMovies = (req, res, next) => {
    req.query.sort = '-ratings';
    req.query.limit = '5';

    next();
}

exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
    let features = new ApiFeatures(Movie.find(), req.query, ['sort', 'fields', 'page', 'limit'])
                                            .filter();                                                                      //Object to find the movie count and add it to below object
    const moviesCount = await features.query.countDocuments();

    features = new ApiFeatures(Movie.find(), req.query, ['sort', 'fields', 'page', 'limit'], moviesCount)
                                            .filter()
                                            .sort()
                                            .limitFields()
                                            .paginate();
    const movies = await features.query;

    res.status(200).json({
        status: 'success',
        length: movies.length,
        data: {
            movies
        }
    })
});

exports.getMovie = asyncErrorHandler(async (req, res, next) => {
    const movie = await Movie.find({_id: req.params.id});

    if(movie.length == 0){
        const error = new CustomError('Movie with that ID is not found!', 404);
        return next(error);             //return: avoid run rest of the code
    }

    res.status(200).json({
        status: 'success',
        data: {
            movie
        }
    })
});

exports.createMovie = asyncErrorHandler(async (req, res, next) => {
    req.body.createdBy = req.user.name;
    const newMovie = await Movie.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newMovie
        }
    })
});

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {
    const updatedMovie = await Movie.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, runValidators: true});

    if(!updatedMovie){
        const error = new CustomError('Movie with that ID is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            updatedMovie
        }
    })
});

exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
    const deletedMovie = await Movie.findOneAndDelete({_id: req.params.id});

    if(!deletedMovie){
        const error = new CustomError('Movie with that ID is not found!', 404);
        return next(error);
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.getMovieByGenre = asyncErrorHandler(async (req, res, next) => {
    const genre = req.params.genre;
    const movies = await Movie.aggregate([
        {$unwind: '$genres'},
        {$group: {
            _id: '$genres',
            movieCount: {$sum: 1},
            movies: {$push: '$name'},

        }},
        {$addFields: {genre: '$_id'}},
        {$project: {_id: 0}},
        {$sort: {movieCount: -1}},
        // {$limit: 6},
        {$match: {genre: genre}}
    ]);

    res.status(200).json({
        status: 'success',
        length: movies.length,
        data: {
            movies
        }
    })
});

exports.getMovieByDirector = asyncErrorHandler(async (req, res, next) => {
    const director = req.params.director;
    const movies = await Movie.aggregate([
        {$unwind: '$directors'},
        {$group: {
            _id: '$directors',
            movieCount: {$sum: 1},
            movies: {$push: '$name'},

        }},
        {$addFields: {director: '$_id'}},
        {$project: {_id: 0}},
        {$sort: {movieCount: -1}},
        {$match: {director: director}}
    ]);

    res.status(200).json({
        status: 'success',
        length: movies.length,
        data: {
            movies
        }
    })
});