const express = require('express');
const videosController = require('./../Controllers/videosController');
const authController = require('./../Controllers/authController');

const videosRouter = express.Router();

videosRouter.route('/highest-rated')
    .get(authController.protect, videosController.getHighestRatedVideos, videosController.getAllVideos)

videosRouter.route('/video-by-genre/:genre')
    .get(authController.protect, videosController.getVideoByGenre)

videosRouter.route('/video-by-director/:director')
    .get(authController.protect, videosController.getVideoByDirector)

videosRouter.route('/')
    .get(authController.protect, videosController.getAllVideos)
    .post(authController.protect, authController.restrict('admin'), videosController.createVideo)

videosRouter.route('/:name')
    .get(authController.protect, videosController.getVideo)
    .patch(authController.protect, authController.restrict('admin'), videosController.updateVideo)
    .delete(authController.protect, authController.restrict('admin'), videosController.deleteVideo)

module.exports = videosRouter;