const express = require('express');
const authController = require('./../Controllers/authController');

const authRouter = express.Router();

authRouter.route('/signup')
    .post(authController.signup);

module.exports = authRouter;