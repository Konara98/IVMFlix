const { error } = require('console');
const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const moviesRouter = require('./Routes/moviesRoutes');
const videosRouter = require('./Routes/videosRoutes');
const authRouter = require('./Routes/authRoutes');
const cartsRouter = require('./Routes/cartRoutes');
const ordersRouter = require('./Routes/orderRoutes');
const paymentRouter =  require('./Routes/paymentsRoutes');
const CustomError = require('./Utils/CustomError');
const errorController = require('./Controllers/errorController');
const path = require('path');

let app = express();                        //Create an instance of the Express application.                     

app.use(express.json());                    //Addeed data from the body to request(req) object
app.use(express.static('./Public'));        //Serve static files from the 'Public' directory.

app.use(bodyparser.urlencoded({extended:false}))    // Middleware to parse incoming URL-encoded form data
app.use(bodyparser.json())                          // Middleware to parse incoming JSON payloads

// Use Morgan(3 rd party middleware) middleware for logging HTTP requests in the development environment.
if(process.env.NODE_ENV === 'development'){ 
    app.use(morgan('dev'));                 
}

// Custom middleware to add a timestamp to the request object.
app.use((req, res, next) => {               
    req.requestAt = new Date().toISOString();
    next();
});     

/*
 * These settings configure Express to use EJS templates for rendering views
 */
app.set('views', path.join(__dirname, 'Views'));        // Set the directory for views
app.set('view engine', 'ejs');                          // Set the view engine to EJS
     
// Set up routes for different parts of the application using the respective routers.
app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/videos', videosRouter);
app.use('/api/v1/carts', cartsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/users', authRouter);
app.use('/api/v1/payments', paymentRouter);
app.all('*', (req, res, next) => {              //Handle requests for routes that are not defined with a 404 error.
    const err = new CustomError(`Can't find ${req.originalUrl} on this server!`, 404);
    next(err);
});

// Use the global error handler to handle all errors.
app.use(errorController.globalErrorHandler);

module.exports = app;
