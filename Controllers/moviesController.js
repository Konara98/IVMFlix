const Movie = require('./../Models/movieModel');
const ApiFeatures = require('./../Utils/ApiFeatures');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');

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
        const movie = await Movie.find({name: req.params.name});

        res.status(200).json({
            status: 'success',
            data: {
                movie
            }
        })
});

exports.createMovie = asyncErrorHandler(async (req, res, next) => {
    const newMovie = await Movie.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newMovie
        }
    })
});

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {
        const updatedMovie = await Movie.findOneAndUpdate(req.params, req.body, {new: true, runValidators: true});

        res.status(200).json({
            status: 'success',
            data: {
                updatedMovie
            }
        })
});

exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
        await Movie.findOneAndDelete(req.params);

        res.status(204).json({
            status: 'success',
            data: null
        })
});

exports.getMovieStats = asyncErrorHandler(async (req, res, next) => {
        const stats = await Movie.aggregate([
            {$match: {ratings: {$gte: 4.5}}},
            {$group: {
                _id: '$releaseYear',            //group on this field
                avgRating: {$avg: '$ratings'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'},
                priceTotal: {$sum: '$price'},
                moviCount: {$sum: 1}
            }},
            {$sort: {minPrice: 1}},
            // {$match: {maxPrice: {$gte: 60}}}
        ]);

        res.status(200).json({
            status: 'success',
            length: stats.length,
            data: {
                stats
            }
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