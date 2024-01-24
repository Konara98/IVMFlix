const Order = require('../Models/ordersModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');

/**
 * Controller function to get all orders for specific user
 */
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find({email: req.user.email});

    res.status(200).json({
        status: 'success',
        length: orders.length,
        data: {
            orders
        }
    })
});

/**
 * Controller function to get specific order for specific user
 */
exports.getOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findOne({_id: req.params.id});

    if(!order){
        const error = new CustomError('Order with that id is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    })
});

/**
 * Controller function to place a order
 */
exports.createOrder = asyncErrorHandler(async (req, res, next) => { 
    req.body.email = req.user.email;
    req.body.name = req.user.name;
    const newOrder = await Order.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newOrder
        }
    })
    next();
});

/**
 * Controller function to delete order
 */
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const deletedOrder = await Order.findOneAndDelete({_id: req.params.id});

    if(!deletedOrder){
        const error = new CustomError('Order is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: null
    })
});
