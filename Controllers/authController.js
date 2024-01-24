const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');

const signToken = (id, email) => {
    return jwt.sign({id, email}, process.env.SECRETE_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

/**
 * Controller function to handle sign up
 */
exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id, newUser.email);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            newUser
        }
    })

    //Add user details to request for using next controllers
    req.user = newUser;    
    next();
});

/**
 * Controller function to handle log in
 */
exports.login = asyncErrorHandler(async (req, res, next) => {
    const {email, password} = req.body;

    //Check if email & password is present in request body
    if(!email || !password){
        const err = new CustomError('Please provide email ID & password for login!', 400);
        return next(err);
    }

    //Check if user exists with given email
    const user = await User.findOne({email: email}).select('+password');

    //Check if the user exists & password matches
    if(!user || !(await user.comparePasswordInDb(password, user.password))){
        const err = new CustomError('Incorrect email or password!');
        return next(err);
    }

    const token = signToken(user._id, user.email);

    res.status(201).json({
        status: 'success',
        token,
        user
    })
});

/**
 * Controller function to allow access to routes
 */
exports.protect = asyncErrorHandler(async (req, res, next) => {
    //1. Read token and check if it exists
    const testToken = req.headers.authorization;
    let token;

    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];
    }

    if(!token){
        return next(new CustomError('You are not logged in!', 401));
    }

    //2. validate the token
    const decodedToken = jwt.verify(token, process.env.SECRETE_STR);

    //3. If the user exists
    const user = await User.findById(decodedToken.id);

    if(!user){
        return next(new CustomError('The user with the given token does not exists!', 401));
    }

    //4. If the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    if(isPasswordChanged){
        return next(new CustomError('The password has been changed recently. please login again!', 401));
    }

    //5. Allow user to access route
    req.user = user;    //add user details to request
    next();
});

/**
 * Controller function to handle authorization
 */
exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            return next(new CustomError('You do not have permission to perform this action!!', 403));
        }
        next();
    }
}

/**
 * Controller function to handle forgot password
 */
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    //1. Get user based on posted email
    const email = req.body.email;
    if(!email){
        return next(new CustomError('Please provide email for reset password!', 400));
    }

    const user = await User.findOne({email: email});
    if(!user){
        return next(new CustomError('Could not find the user with the given email!', 404));
    }

    //2. Generate a random reset token
    const resetToken = await user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});           //only validate when create and update a user
    
    //3. Send the token back to the user email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
    const message = `We have recieved a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 miniutes.`;
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password change request recieved',
            message: message
        });

        res.status(200).json({
            status: 'success',
            message: 'Password reset link send to the user email'
        });
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpire = undefined;
        user.save({validateBeforeSave: false});

        return next(new CustomError('There was an error sending password reset email. Please try again later!', 500));
    }
})

/**
 * Controller function to handle reset password
 */
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpire: {$gt: Date.now()}});

    if(!user){
        return next(new CustomError('Token is invalid or has expired!', 400));
    }

    if(!req.body.password || !req.body.confirmPassword){
        return next(new CustomError('Please provide password and confirmPassword for reset password!', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    const loginToken = signToken(user._id, user.email);

    res.status(201).json({
        status: 'success',
        token: loginToken
    })
});