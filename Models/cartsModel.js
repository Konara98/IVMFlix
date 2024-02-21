const mongoose = require('mongoose');
const validator = require('validator');

const itemSchema = new mongoose.Schema({
    item_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Name is required!'],
        maxlength: [100, 'Item name must not have more than 100 characters'],
        minlength: [3, 'Item name must not have less than 3 characters'],
        trim: true
    },
    coverImage: {
        type: String,
        required: [true, 'Cover Image is required!'],
        validate: [validator.isURL, 'Cover Image must be a URL!']
    },
    price: {
        type: Number,
        required: [true, 'Price is required!']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required!']
    }
})

const cartSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    items: [itemSchema]
})

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;