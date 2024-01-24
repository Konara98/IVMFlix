/**
 * Define a custom error class that extends the built-in Error class.
 */
class CustomError extends Error{           
    constructor(message, statusCode){
        super(message);            
        this.statusCode = statusCode;       //Set additional properties specific to the custom error.
        this.status = statusCode >= 400 && statusCode < 500? 'fail' : 'error'; 

        this.isOperational = true;          // Flag indicating whether the error is operational.

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = CustomError;
