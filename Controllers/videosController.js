const Video = require('./../Models/videoModel');
const ApiFeatures = require('./../Utils/ApiFeatures');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');

exports.getHighestRatedVideos = (req, res, next) => {
    req.query.sort = '-ratings';
    req.query.limit = '5';

    next();
}

exports.getAllVideos = asyncErrorHandler(async (req, res, next) => {
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
});

exports.getVideo = asyncErrorHandler(async (req, res, next) => {
        const video = await Video.find(req.params);

        res.status(200).json({
            status: 'success',
            data: {
                video
            }
        })
});

exports.createVideo = asyncErrorHandler(async (req, res) => {
        const newVideo = await Video.create(req.body);
    
        res.status(201).json({
            status: 'success',
            data: {
                newVideo
            }
        })
});

exports.updateVideo = asyncErrorHandler(async (req, res) => {
        const updatedVideo = await Video.findOneAndUpdate(req.params, req.body, {new: true, runValidators: true});

        res.status(200).json({
            status: 'success',
            data: {
                updatedVideo
            }
        })
});

exports.deleteVideo = asyncErrorHandler(async (req, res) => {
        await Video.findOneAndDelete(req.params);

        res.status(204).json({
            status: 'success',
            data: null
        })
});

exports.getVideoByGenre = asyncErrorHandler(async (req, res) => {
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
});

exports.getVideoByDirector = asyncErrorHandler(async (req, res) => {
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
});