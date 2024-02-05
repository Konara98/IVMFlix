const express = require('express');
const authController = require('./../Controllers/authController');
const cartsController = require('../Controllers/cartsController');

const authRouter = express.Router();

/**
 * Define routes for authentication.
 */
authRouter.route('/signup')
    .post(authController.signUp, cartsController.createCart);

authRouter.route('/resendverificationcode')
    .post(authController.resendVerificationCode);

authRouter.route('/verify')
    .post(authController.verify); 

authRouter.route('/signin')
    .post(authController.signIn);

authRouter.route('/forgotpassword')
    .post(authController.forgotPassword);

authRouter.route('/resetpassword')
    .post(authController.resetPassword);

module.exports = authRouter;