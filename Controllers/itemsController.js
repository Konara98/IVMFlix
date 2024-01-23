const Item = require('./../Models/itemsModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const CustomError = require('./../Utils/CustomError');

exports.getAllItems = asyncErrorHandler(async (req, res, next) => {
    const items = await Item.find({createdBy: req.user.email});

    res.status(200).json({
        status: 'success',
        length: items.length,
        data: {
            items
        }
    })
});

exports.createItem = asyncErrorHandler(async (req, res, next) => {
    const item = await Item.find({createdBy: req.user.email, name: req.body.name});
    if(item.length != 0){
        const error = new CustomError('Item with that name is already exists!', 409);
        return next(error);
    }

    req.body.createdBy = req.user.email;
    const newItem = await Item.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newItem
        }
    })
});

exports.updateItem = asyncErrorHandler(async (req, res, next) => {
    req.params.createdBy = req.user.email;
    const updatedItem = await Item.findOneAndUpdate(req.params, req.body, {new: true, runValidators: true});

    if(!updatedItem){
        const error = new CustomError('Item with that name is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            updatedItem
        }
    })
});

exports.deleteItem = asyncErrorHandler(async (req, res, next) => {
    req.params.createdBy = req.user.email;
    const deletedItem = await Item.findOneAndDelete(req.params);

    if(!deletedItem){
        const error = new CustomError('Item with that name is not found!', 404);
        return next(error);
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
});