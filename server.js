const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...');
})

const app = require('./app');

//connect database
mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    console.log('DB connection succesful!');
})

//create the server
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log('Server has started...');
})

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured! Shutting down...');

    server.close(() => {
        process.exit(1);
    })
})