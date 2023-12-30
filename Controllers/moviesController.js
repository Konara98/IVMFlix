const Movie = require('./../Models/movieModel');

exports.getAllMovies = async (req, res) => {
    try{
        //exclude unwanted filtering objects
        const excludeFields = ['sort', 'page', 'limit', 'fields'];
        const excludedQueryObj = {...req.query};
        excludeFields.forEach((el) => {
            delete excludedQueryObj[el];
        })

        //apply filtering
        let queryStr = JSON.stringify(excludedQueryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryObj = JSON.parse(queryStr);

        let query = Movie.find(queryObj);       //return query object

        //sorting logic
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else{
            query = query.sort('-releaseDate');
        }

        //limiting logic
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } 

        const movies = await query;             //return array

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