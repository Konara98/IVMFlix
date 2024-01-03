const express = require('express');
const videosController = require('./../Controllers/videosController');

const videosRouter = express.Router();

videosRouter.route('/highest-rated')
    .get(videosController.getHighestRatedVideos, videosController.getAllVideos)

videosRouter.route('/')
    .get(videosController.getAllVideos)
    .post(videosController.createVideo)

videosRouter.route('/:name')
    .get(videosController.getVideo)
    .patch(videosController.updateVideo)
    .delete(videosController.deleteVideo)

module.exports = videosRouter;