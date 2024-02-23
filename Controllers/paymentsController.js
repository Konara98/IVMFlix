const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const Links = require('../Utils/GenerateDownloadLinks');
const SES = require('../AWS-services/SESServices');
const CustomError = require('./../Utils/CustomError');
const Order = require('../Models/ordersModel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/*
 * Render Payment Page
 */
exports.renderPaymentPage = (req, res) => {
	res.render('Payment', {								// Render the 'Payment' view with necessary data
		key: process.env.STRIPE_PUBLIC_KEY,				// Pass the Stripe public key to the view
		total_price: req.total_price,					// Pass the total_price to the view
		order_id: req.order_id
	})
}

/*
 * Create Payment
 */
exports.createPayment = (req, res, next) => {
	const totalPrice = parseFloat(req.body.total_price);
	const orderId = req.body.order_id;

	stripe.customers.create({							 // Create a new customer in Stripe
		email: req.body.stripeEmail,
		source: req.body.stripeToken
		 // Add additional user details after authentication if needed
	})
	.then((customer) => {								// Charge the customer's card with the provided total price
		return stripe.charges.create({
			amount: totalPrice * 100, 					// Amount in cents (Stripe expects amount in smallest currency unit)
			description: 'IVMFlix development product',
			currency: 'USD',							// Currency of the payment
			customer: customer.id						// Customer ID retrieved from Stripe
		});
	})
	.then((charge) => {
		console.log("Payment Successful!");

		req.orderId = orderId;
		next();
	})
	.catch((error) => {
		res.status(error.statusCode).json({          				
			status: 'fail',
			message: error.message
		})	
	});
}


/**
 * Controller function to send email for customers
 */
exports.sendDownloadLinksViaEmail = asyncErrorHandler(async (req, res, next) => {
    const links = await Links.generateDownloadLinks(req.orderId);

	// Check if no links were generated
	if(links.length == 0){
		const error = new CustomError('Order with that id is not found!', 404);
		return next(error);
	}

	const email = links[0].email;
	links.shift();											// Remove the first JSON object as it contains the email address

	const data = await SES.sendEmail(email, links, 'lakshithakonara3@gmail.com');

	await Order.findOneAndDelete({_id: req.orderId});		//Delete the order after sending the email	
	
    res.status(200).json({          						// If the payment is successful, send a success response
        status: 'success',
		data
    })
});
