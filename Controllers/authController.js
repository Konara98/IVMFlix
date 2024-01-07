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
    req.user = user;
    next();
});

exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            return next(new CustomError('You do not have permission to perform this action!!', 403));
        }
        next();
    }
}

// exports.restrict = (...role) => {
//     return (req, res, next) => {
//         if(!role.includes(req.user.role)){
//             return next(new CustomError('You do not have permission to perform this action!!', 403));
//         }
//         next();
//     }
// }