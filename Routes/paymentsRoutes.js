const express = require('express');
const authController = require('../Controllers/authController');
const paymentController = require('../Controllers/paymentsController');
const ordersController = require('../Controllers/ordersController');
const downloadController = require('../Controllers/downloadController');

const paymentRouter = express.Router();

/**
 * Define routes for handling payment-related functionality
 */
paymentRouter.route('/:id')
    .get(ordersController.getTotalPriceOfOrderById, paymentController.renderPaymentPage);

paymentRouter.route('/card-payment')
    .post(paymentController.createPayment, downloadController.generateDownloadLinks);

module.exports = paymentRouter;