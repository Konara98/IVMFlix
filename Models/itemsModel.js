const mongoose = require('mongoose');
const validator = require('validator');

const itemSchema = new mongoose.Schema({
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
    },
    createdBy: {
        type: String
    }
})

const Item = mongoose.model('item', itemSchema);

module.exports = Item;