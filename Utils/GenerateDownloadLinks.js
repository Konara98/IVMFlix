const Order = require('../Models/ordersModel');
const S3 = require('../AWS-services/S3Services');
const Movie = require('./../Models/movieModel');
const Video = require('./../Models/videoModel');

/**
 * Controller function to generate download links for items in an order
 */
exports.generateDownloadLinks = async (orderId) => {
    // Find the order based on the provided order ID
    const order = await Order.findOne({_id: orderId});

    // Initialize an array to store the email and download links
    let downloadLinks = [];

    // Check if the order exists
    if(!order){
        return downloadLinks;
    }

    //Store email of the user
    downloadLinks.push({
        email: order.email
    });

    // Iterate through each item in the order
    let file_path, file_name, duration;
    for(let i = 0; i < order.items.length; i++){
        const movie_item = await Movie.find({_id: order.items[i].item_id});
        const video_item = await Video.find({_id: order.items[i].item_id});

        // Determine the file path, file name, and duration based on the type of item
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

        // Generate a pre-signed URL for the item
        const link = await S3.getPreSingedUrl(file_path, file_name, duration);

        // Create an object with name and URL and push it to the downloadLinks array
        downloadLinks.push({
            name: order.items[i].name,
            url: link
        });
    }
    
    return downloadLinks;
}