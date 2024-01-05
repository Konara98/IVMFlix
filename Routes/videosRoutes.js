const express = require('express');
const videosController = require('./../Controllers/videosController');

const videosRouter = express.Router();

videosRouter.route('/highest-rated')
    .get(videosController.getHighestRatedVideos, videosController.getAllVideos)

videosRouter.route('/video-by-genre/:genre')
    .get(videosController.getVideoByGenre)

videosRouter.route('/video-by-director/:director')
    .get(videosController.getVideoByDirector)

videosRouter.route('/')
    .get(videosController.getAllVideos)
    .post(videosController.createVideo)

videosRouter.route('/:name')
    .get(videosController.getVideo)
    .patch(videosController.updateVideo)
    .delete(videosController.deleteVideo)

module.exports = videosRouter;