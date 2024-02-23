const Order = require('../Models/ordersModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');
const S3 = require('../AWS-services/S3Services');
const Movie = require('./../Models/movieModel');
const Video = require('./../Models/videoModel');

exports.generateDownloadLinks = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findOne({_id: req.orderId});

    if(!order){
        const error = new CustomError('Order with that id is not found!', 404);
        return next(error);
    }

    let file_path, file_name, duration;
    for(let i = 0; i < order.items.length; i++){
        const movie_item = await Movie.find({_id: order.items[i].item_id});
        const video_item = await Video.find({_id: order.items[i].item_id});

        if(movie_item.length !== 0){
            file_path = 'ivm-flix-storage/Movies';
            file_name = order.items[i].item_id + '.jpg';
            duration = 60 * order.items[i].quantity;
        }
        if(video_item.length !== 0){
            file_path = 'ivm-flix-storage/Videos';
            file_name = order.items[i].item_id + '.jpg';
            duration = 60 * order.items[i].quantity;
        }

        const link = await S3.getPreSingedUrl(file_path, file_name, duration);
        console.log(order.items[i].name, link);
    }
    
    res.status(200).json({          // If the payment is successful, send a success response
        status: 'success'
    })
});