const express = require('express');
const authController = require('../Controllers/authController');
const cartsController = require('../Controllers/cartsController');

const cartsRouter = express.Router();

/**
 * Define routes for handling cart-related functionality.
 */
cartsRouter.route('/')
    .get(authController.protect, authController.restrict('user'), cartsController.getAllItemsInCart)
    .patch(authController.protect, authController.restrict('user'), cartsController.addItemToCart)

cartsRouter.route('/:name')
    .patch(authController.protect, authController.restrict('user'), cartsController.updateItemInCart)
    .delete(authController.protect, authController.restrict('user'), cartsController.deleteItemInCart)

module.exports = cartsRouter;