const Cart = require('../Models/cartsModel');
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
});

/**
 * Controller function to add items to cart
 */
exports.addItemToCart = asyncErrorHandler(async (req, res, next) => {
    //Use findOne method since there is only one cart for each user
    const cart = await Cart.findOne({email: req.user.email});

    //Avoid duplicating items in the cart
    for(let i = 0; i < cart.items.length; i++){
        if(cart.items[i].name === req.body.name){
            const error = new CustomError('Item with that name is already exists!', 409);
            return next(error);
        }
    }

    cart.items.push(req.body);
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
    const updatedItem = await Cart.findOneAndUpdate({email: req.user.email, 'items.name': req.params.name},
                            { "$set": {'items.$.quantity': req.body.quantity}},
                            {new: true, runValidators: true});  // Update the quantity based on the request body

    if(!updatedItem){
        const error = new CustomError('Item with that name is not found!', 404);
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
    const deletedItem = await Cart.findOneAndUpdate({email: req.user.email, 'items.name': req.params.name},
                            {"$pull": {'items': {"name": req.params.name}}},
                            {new: true, runValidators: true});

    if(!deletedItem){
        const error = new CustomError('Item with that name is not found!', 404);
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
