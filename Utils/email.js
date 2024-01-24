const nodemailer = require('nodemailer');

/**
 * Define a function to send emails asynchronously.
 */
const sendEmail = async (option) => {
    //Create a transporter using the nodemailer module.
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    //Define email options, including sender, recipient, subject, and message.
    const emailOptions = {
        from: 'IVMFlix support<support@IVMFlix.com>',   // Sender's email address.
        to: option.email,                               // Recipient's email address.
        subject: option.subject,                        // Email subject.
        text: option.message                            //Email message content.
    }

    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;