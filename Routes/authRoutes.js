const express = require('express');
const authController = require('./../Controllers/authController');
const cartsController = require('../Controllers/cartsController');

const authRouter = express.Router();

authRouter.route('/signup')
    .post(authController.signup, authController.restrict('user'), cartsController.createCart);

authRouter.route('/signin')
    .post(authController.login);

authRouter.route('/forgotpassword')
    .post(authController.forgotPassword);

authRouter.route('/resetpassword/:token')
    .patch(authController.resetPassword);


module.exports = authRouter;