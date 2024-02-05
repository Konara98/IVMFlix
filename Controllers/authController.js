'use strict';
require('dotenv').config();
const Cognito = require('../AWS-services/cognitoServices');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const CustomError = require('./../Utils/CustomError');

/**
 * Controller function to handle sign up
 */
exports.signUp = asyncErrorHandler(async (req, res, next) => {
    const response = await Cognito.signUp(req.body.name, req.body.email, req.body.password);
    if (!req.body.name) {
        return next(new CustomError('Missing required attribute: name', 400));
    }

    //Send user details to create a cart for newly joined users
    if(response.statusCode == 201){
        const user = {
            name: req.body.name,
            email: req.body.email
        }

        req.user = user;
        req.previousResponse = response;

        next();
    }
    else{
        res.status(response.statusCode).json(response);
    }
    
});

/**
 * Controller function to resend verification code
 */
exports.resendVerificationCode = asyncErrorHandler(async (req, res, next) => {
    const response = await Cognito.resendVerificationCode(req.body.email);
    res.status(response.statusCode).json(response);
});

/**
 * Controller function to verify sign up(email)
 */
exports.verify = asyncErrorHandler(async (req, res, next) => {
    const response = await Cognito.verify(req.body.email, req.body.codeEmailVerify);
    res.status(response.statusCode).json(response);
});

/**
 * Controller function to handle log in
 */
exports.signIn = asyncErrorHandler(async (req, res, next) => {
    const response = await Cognito.signIn(req.body.email, req.body.password);
    res.status(response.statusCode).json(response);
});

/**
 * Controller function to verify Cognito token and handle authentication
 */
exports.protect = asyncErrorHandler(async (req, res, next) => {
    const testToken = req.headers.authorization;
    let token;

    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];
    }

    if(!token){
        return next(new CustomError('You are not logged in!', 401));
    }
    
    const user = Cognito.protect(token);
    req.user = user;

    next();
});

/**
 * Controller function to handle authorization
 */
exports.restrict = (role) => {
    return (req, res, next) => {
        const userRoles = req.user['cognito:groups'];

        if(!userRoles.includes(role)){
            return next(new CustomError('You do not have permission to perform this action!', 403));
        }

        next();
    }
}

/**
 * Controller function to handle forgot password
 */
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const response = await Cognito.forgotPassword(req.body.email);
    res.status(response.statusCode).json(response);
})

/**
 * Controller function to handle reset password
 */
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    const response = await Cognito.resetPassword(req.body.email, req.body.verificationCode, req.body.newPassword);
    res.status(response.statusCode).json(response);
});