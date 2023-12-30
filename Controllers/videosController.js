const Video = require('./../Models/videoModel');

exports.getAllVideos = async (req, res) => {
    try{
        const videos = await Video.find();

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