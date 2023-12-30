const { error } = require('console');
const express = require('express');
const morgan = require('morgan');
const moviesRouter = require('./Routes/moviesRoutes');
const videosRouter = require('./Routes/videosRoutes');

let app = express();

app.use(express.json());                    //addeed data from the body to request(req) object
app.use(express.static('./Public'));        //serving static files

if(process.env.NODE_ENV === 'development'){ 
    app.use(morgan('dev'));                 //3 rd party middleware
}

app.use((req, res, next) => {               //Custom middleware
    req.requestAt = new Date().toISOString();
    next();
});             
            
app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/videos', videosRouter);

module.exports = app;
