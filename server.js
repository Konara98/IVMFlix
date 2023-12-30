const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');

//connect database
mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    console.log('DB connection succesful!');
}).catch((error) => {
    console.log('Database connection failed!');
})

//create the server
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server has started...');
})