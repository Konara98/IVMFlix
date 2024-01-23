const express = require('express');
const authController = require('../Controllers/authController');
const cartsController = require('../Controllers/cartsController');

const cartsRouter = express.Router();

cartsRouter.route('/')
    .get(authController.protect, authController.restrict('user'), cartsController.getAllItemsInCart)
    .patch(authController.protect, authController.restrict('user'), cartsController.addItemToCart)
    .delete(authController.protect, authController.restrict('user'), cartsController.deleteAllItemsInCart)

cartsRouter.route('/:name')
    .patch(authController.protect, authController.restrict('user'), cartsController.updateItemInCart)
    .delete(authController.protect, authController.restrict('user'), cartsController.deleteItemInCart)

module.exports = cartsRouter;