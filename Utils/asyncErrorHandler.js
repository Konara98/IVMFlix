/**
 * Export a higher-order function that takes an asynchronous function as an argument.
 */
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(err => next(err));
    }
}