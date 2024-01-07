const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');

exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = jwt.sign({id: newUser._id, email: newUser.email}, process.env.SECRETE_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })

    res.status(201).json({
        status: 'success',
        token,
        data: {
            newUser
        }
    })
});