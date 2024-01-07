const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');

const signToken = (id, email) => {
    return jwt.sign({id, email}, process.env.SECRETE_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

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
});

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