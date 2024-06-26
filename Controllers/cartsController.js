const Cart = require('../Models/cartsModel');
const Movie = require('./../Models/movieModel');
const Video = require('./../Models/videoModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');

/**
 * Controller function to get all items in the cart for specific user
 */
exports.getAllItemsInCart = asyncErrorHandler(async (req, res, next) => {
    //Use findOne method since there is only one cart for each user
    const cart = await Cart.findOne({email: req.user.email});

    res.status(200).json({
        status: 'success',
        data: {
            items_length: cart.items.length,
            cart
        }
    })
});

/**
 * Controller function to create a cart for specific user(When user sign up he/she has been given a one cart)
 */
exports.createCart = asyncErrorHandler(async (req, res, next) => { 
    //Create a cart for newly singed up users    
    req.body.email = req.user.email;
    req.body.name = req.user.name;
    await Cart.create(req.body);
    
    res.status(req.previousResponse.statusCode).json(req.previousResponse);
});

/**
 * Controller function to add items to cart
 */
exports.addItemToCart = asyncErrorHandler(async (req, res, next) => {
    //Use findOne method since there is only one cart for each user
    const cart = await Cart.findOne({email: req.user.email});

     // Find the movie and video corresponding to the provided ID
    const movie = await Movie.find({_id: req.params.id});
    const video = await Video.find({_id: req.params.id});

    // Check if either movie or video is found with the provided ID
    if(movie.length == 0 && video.length == 0){
        const error = new CustomError('Item with that ID is not found!', 404);
        return next(error);             //return: avoid run rest of the code
    }

    // Determine whether the item is a movie or a video
    let item = (movie.length !== 0) ? movie : video;

    // Define the item object to be added to the cart
    item = {
        item_id: item[0]._id,
        name: item[0].name,
        coverImage: item[0].coverImage,
        price: item[0].price,
        quantity: req.body.quantity
    }


    //Avoid duplicating items in the cart
    for(let i = 0; i < cart.items.length; i++){
        if(cart.items[i].item_id == item.item_id){
            const error = new CustomError('Item with that ID is already exists!', 409);
            return next(error);
        }
    }

    // Add the item to the cart and save the changes
    cart.items.push(item);
    await cart.save();

    res.status(200).json({
        status: 'success',
        data: {
            items_length: cart.items.length,
            cart
        }
    })
});

/**
 * Controller function to update items in the cart
 */
exports.updateItemInCart = asyncErrorHandler(async (req, res, next) => {
    const updatedItem = await Cart.findOneAndUpdate({email: req.user.email, 'items.item_id': req.params.id},
                            { "$set": {'items.$.quantity': req.body.quantity}},
                            {new: true, runValidators: true});  // Update the quantity based on the request body

    if(!updatedItem){
        const error = new CustomError('Item with that ID is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            items_length: updatedItem.items.length,
            updatedItem
        }
    })
});

/**
 * Controller function to delete item in the cart
 */
exports.deleteItemInCart = asyncErrorHandler(async (req, res, next) => {
    const deletedItem = await Cart.findOneAndUpdate({email: req.user.email, 'items.item_id': req.params.id},
                            {"$pull": {'items': {"item_id": req.params.id}}},
                            {new: true, runValidators: true});

    if(!deletedItem){
        const error = new CustomError('Item with that ID is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            items_length: deletedItem.items.length,
            deletedItem
        }
    })
});

/**
 * Controller function to delete all items in the cart
 */
exports.deleteAllItemsInCart = asyncErrorHandler(async (req, res, next) => {
    await Cart.findOneAndUpdate({email: req.user.email},
                                {"$pull": {'items': {}}},
                                {new: true, runValidators: true});
});

/**
 * Controller function to select all items in the cart excluding _id, __v fields
 */
exports.getAllItemsInCartExcludingIDFields = asyncErrorHandler(async (req, res, next) => {
    const order = await Cart.findOne({email: req.user.email}).select({'items._id': 0, '__v': 0 });
    req.body.items = order.items;

    if(order.items.length == 0){
        const error = new CustomError('Cart is empty!', 404);
        return next(error);
    }
    next();
});
