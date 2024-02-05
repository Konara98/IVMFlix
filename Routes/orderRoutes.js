const express = require('express');
const authController = require('../Controllers/authController');
const ordersController = require('../Controllers/ordersController');
const cartController = require('../Controllers/cartsController');

const ordersRouter = express.Router();

/**
 * Define routes for handling order-related functionality
 */
ordersRouter.route('/')
    .get(authController.protect, authController.restrict('User'), ordersController.getAllOrders)

ordersRouter.route('/place-order')
    .post(authController.protect, authController.restrict('User'), cartController.getAllItemsInCartExcludingIDFields, ordersController.createOrder, cartController.deleteAllItemsInCart)

ordersRouter.route('/:id')
    .get(authController.protect, authController.restrict('User'), ordersController.getOrder)
    .delete(authController.protect, authController.restrict('User'), ordersController.deleteOrder)

module.exports = ordersRouter;