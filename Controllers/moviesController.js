const Movie = require('./../Models/movieModel');
const ApiFeatures = require('./../Utils/ApiFeatures');

exports.getHighestRatedMovies = (req, res, next) => {
    req.query.sort = '-ratings';
    req.query.limit = '5';

    next();
}

exports.getAllMovies = async (req, res) => {
    try{
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
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.getMovie = async (req, res) => {
    try{
        const movie = await Movie.find({name: req.params.name});

        res.status(200).json({
            status: 'success',
            data: {
                movie
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.createMovie = async (req, res) => {
  try{
    const newMovie = await Movie.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newMovie
        }
    })
  } catch(err){
    res.status(400).json({
        status: 'fail',
        message: err.message
    })
  }
}

exports.updateMovie = async (req, res) => {
    try{
        const updatedMovie = await Movie.findOneAndUpdate(req.params, req.body, {new: true, runValidators: true});

        res.status(200).json({
            status: 'success',
            data: {
                updatedMovie
            }
        })
    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.deleteMovie = async (req, res) => {
    try{
        await Movie.findOneAndDelete(req.params);

        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.getMovieStats = async (req, res) => {
    try{
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
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.getMovieByGenre = async (req, res) => {
    try{
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
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.getMovieByDirector = async (req, res) => {
    try{
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
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}