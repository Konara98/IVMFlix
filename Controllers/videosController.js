const Video = require('./../Models/videoModel');
const ApiFeatures = require('./../Utils/ApiFeatures');

exports.getHighestRatedVideos = (req, res, next) => {
    req.query.sort = '-ratings';
    req.query.limit = '5';

    next();
}

exports.getAllVideos = async (req, res) => {
    try{
        let features = new ApiFeatures(Video.find(), req.query, ['sort', 'fields', 'page', 'limit'])
                                            .filter();                                                                      //Object to find the video count and add it to below object
        const videosCount = await features.query.countDocuments();

        features = new ApiFeatures(Video.find(), req.query, ['sort', 'fields', 'page', 'limit'], videosCount)
                                            .filter()
                                            .sort()
                                            .limitFields()
                                            .paginate();
        const videos = await features.query;

        res.status(200).json({
            status: 'success',
            length: videos.length,
            data: {
                videos
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.getVideo = async (req, res) => {
    try{
        const video = await Video.find(req.params);

        res.status(200).json({
            status: 'success',
            data: {
                video
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.createVideo = async (req, res) => {
    try{
        const newVideo = await Video.create(req.body);
    
        res.status(201).json({
            status: 'success',
            data: {
                newVideo
            }
        })
      } catch(err){
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
      }
}

exports.updateVideo = async (req, res) => {
    try{
        const updatedVideo = await Video.findOneAndUpdate(req.params, req.body, {new: true, runValidators: true});

        res.status(200).json({
            status: 'success',
            data: {
                updatedVideo
            }
        })
    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.deleteVideo = async (req, res) => {
    try{
        await Video.findOneAndDelete(req.params);

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

exports.getVideoByGenre = async (req, res) => {
    try{
        const genre = req.params.genre;
        const videos = await Video.aggregate([
            {$unwind: '$genres'},
            {$group: {
                _id: '$genres',
                videoCount: {$sum: 1},
                videos: {$push: '$name'},

            }},
            {$addFields: {genre: '$_id'}},
            {$project: {_id: 0}},
            {$sort: {videoCount: -1}},
            {$match: {genre: genre}}
        ]);

        res.status(200).json({
            status: 'success',
            length: videos.length,
            data: {
                videos
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.getVideoByDirector = async (req, res) => {
    try{
        const director = req.params.director;
        const videos = await Video.aggregate([
            {$unwind: '$directors'},
            {$group: {
                _id: '$directors',
                videoCount: {$sum: 1},
                videos: {$push: '$name'},

            }},
            {$addFields: {director: '$_id'}},
            {$project: {_id: 0}},
            {$sort: {videoCount: -1}},
            {$match: {director: director}}
        ]);

        res.status(200).json({
            status: 'success',
            length: videos.length,
            data: {
                videos
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}