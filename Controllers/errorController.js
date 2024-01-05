exports.globalErrorHandler = (error, req, res, next) => {        //global error handling
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message
    });
}