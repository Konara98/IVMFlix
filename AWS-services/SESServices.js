const AWS = require('aws-sdk');

// Set the AWS configuration
AWS.config.update({
    region: process.env.SES_REGION, 
    accessKeyId: process.env.SES_ACCESS_KEY_ID, 
    secretAccessKey: process.env.SES_SECRETE_ACCESS_KEY_ID 
});

// Create a new SES object
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * Function to send an email using SES
 */
exports.sendEmail = async (toAddresses, body, source) => {
    // Convert the bodyData array into a formatted string
    const bodyContent = body.map(item => {
        return `${item.name}: ${item.url}`;
    }).join('\n\n');

    const params = {
        Destination: {
            ToAddresses: [toAddresses]
        },
        Message: {
            Body: {
                Text: {
                    Data: bodyContent
                }
            },
            Subject: {
                Data: 'IVMFlix Download Links'
            }
        },
        Source: source
    };

    // Send the email using the SES object and parameters
    try {
        const data = await ses.sendEmail(params).promise();
        console.log("Email sent:", data);
        return data;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw error;
    }
}
