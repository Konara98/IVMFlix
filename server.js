const mongoose = require('mongoose');       // Import required modules: mongoose for MongoDB interaction.
const dotenv = require('dotenv');           // Import required modules: dotenv for environment variables.      
dotenv.config({path: './config.env'});      // Load environment variables from the specified file.

/*
 * Set up an event listener for uncaught exceptions.
 */
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...');
})

const app = require('./app');               // Import the main application.

//connect database
mongoose.connect(process.env.CONN_STR)
    .then((conn) => {
    console.log('DB connection succesful!');
})

//create the server to listen on the specified port or default to 3000.
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log('Server has started...');
})

/*
 * Set up an event listener for unhandled promise rejections using the 'unhandledRejection' event.
 */
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured! Shutting down...');

    // Close the server gracefully before shutting down the process.
    server.close(() => {
        // Once the server is closed, exit the process with a non-zero code (1) to indicate an error.
        process.exit(1);
    })
})