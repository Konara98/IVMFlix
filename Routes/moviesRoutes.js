const express = require('express');
const moviesController = require('./../Controllers/moviesController');
const authController = require('./../Controllers/authController');

const moviesRouter = express.Router();

/**
 * Define routes for handling movie-related functionality.
 */
moviesRouter.route('/highest-rated')
    .get(authController.protect, moviesController.getHighestRatedMovies, moviesController.getAllMovies)

moviesRouter.route('/movie-by-genre/:genre')
    .get(authController.protect, moviesController.getMovieByGenre)

moviesRouter.route('/movie-by-director/:director')
    .get(authController.protect, moviesController.getMovieByDirector)

moviesRouter.route('/')
    .get(authController.protect, moviesController.getAllMovies)
    .post(authController.protect, authController.restrict('Admin'), moviesController.createMovie)

moviesRouter.route('/:name')
    .get(authController.protect, moviesController.getMovie)
    .patch(authController.protect, authController.restrict('Admin'), moviesController.updateMovie)
    .delete(authController.protect, authController.restrict('Admin'), moviesController.deleteMovie)

module.exports = moviesRouter;