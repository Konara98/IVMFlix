const express = require('express');
const moviesController = require('./../Controllers/moviesController');
const authController = require('./../Controllers/authController');

const moviesRouter = express.Router();

moviesRouter.route('/highest-rated')
    .get(authController.protect, moviesController.getHighestRatedMovies, moviesController.getAllMovies)

moviesRouter.route('/movie-by-genre/:genre')
    .get(authController.protect, moviesController.getMovieByGenre)

moviesRouter.route('/movie-by-director/:director')
    .get(authController.protect, moviesController.getMovieByDirector)

moviesRouter.route('/')
    .get(authController.protect, moviesController.getAllMovies)
    .post(authController.protect, authController.restrict('admin'), moviesController.createMovie)

moviesRouter.route('/:name')
    .get(authController.protect, moviesController.getMovie)
    .patch(authController.protect, authController.restrict('admin'), moviesController.updateMovie)
    .delete(authController.protect, authController.restrict('admin'), moviesController.deleteMovie)

module.exports = moviesRouter;