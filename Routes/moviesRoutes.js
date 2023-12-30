const express = require('express');
const moviesController = require('./../Controllers/moviesController');

const moviesRouter = express.Router();

moviesRouter.route('/highest-rated')
    .get(moviesController.getHighestRatedMovies, moviesController.getAllMovies)

moviesRouter.route('/')
    .get(moviesController.getAllMovies)
    .post(moviesController.createMovie)

moviesRouter.route('/:name')
    .get(moviesController.getMovie)
    .patch(moviesController.updateMovie)
    .delete(moviesController.deleteMovie)

module.exports = moviesRouter;