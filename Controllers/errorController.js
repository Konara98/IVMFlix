const CustomError = require('./../Utils/CustomError');

const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}

const prodErrors = (res, error) => {
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    } else{
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! please try again later!'
        });
    }
}

const duplicateKeyErrorHandler = (err) => {
    const name = err.keyValue.name;
    const msg = `There is already a movie with name ${name}. please use another name`;
    return new CustomError(msg, 400); 
}

exports.globalErrorHandler = (error, req, res, next) => {        //global error handling
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if(process.env.NODE_ENV == 'development'){
        devErrors(res, error);
    } else if (process.env.NODE_ENV == 'production'){
        if(error.code == 11000){
            error = duplicateKeyErrorHandler(error);
        } 
        prodErrors(res, error);
    }
}