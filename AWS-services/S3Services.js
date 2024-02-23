const AWS = require('aws-sdk');

// Create a new instance of AWS S3 with configurations
const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,   
    accessKeyId: process.env.IAM_USER_ACCESS_KEY_ID,      
    secretAccessKey: process.env.IAM_USER_SECRETE_ACCESS_KEY_ID, 
    Bucket: process.env.BUCKET_NAME,       
    signatureVersion: 'v4',
    region: process.env.S3_BUCKET_REGION   
});

/*
* Function to get preSigned URLs for download specific file in S3
*/
exports.getPreSingedUrl = async (file_path, file_name, duration) => {
    const params = {
        Bucket: file_path,          // Bucket where the file is stored
        Key: file_name,             // Key (filename) of the file in the bucket
        Expires: duration           // Expiry duration of the pre-signed URL
    };
    try {
        const url = await new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', params, (err, url) => {
                err ? reject(err) : resolve(url);
            });
        });
        return url;
    } catch (err) {
        if (err) {
            console.log(err)
        }
    }
}