const express = require('express');
const authController = require('../Controllers/authController');
const itemsController = require('../Controllers/itemsController');

const itemsRouter = express.Router();

itemsRouter.route('/')
    .get(authController.protect, itemsController.getAllItems)
    .post(authController.protect, itemsController.createItem)

itemsRouter.route('/:name')
    .patch(authController.protect,itemsController.updateItem)
    .delete(authController.protect, itemsController.deleteItem)

module.exports = itemsRouter;