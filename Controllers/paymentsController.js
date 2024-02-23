const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const generateDownloadLinks = require('../Utils/GenerateDownloadLinks')

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
		req.orderId = orderId;
		next();
	})
	.catch((err) => {
		res.send(err);	
	});
}


/**
 * Controller function to send email for customers
 */
exports.sendEmail = asyncErrorHandler(async (req, res, next) => {
    const links = await generateDownloadLinks.generateDownloadLinks(req.orderId);
    console.log(links);

    res.status(200).json({          // If the payment is successful, send a success response
        status: 'success'
    })
});
