const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,   
    accessKeyId: process.env.IAM_USER_ACCESS_KEY_ID,      
    secretAccessKey: process.env.IAM_USER_SECRETE_ACCESS_KEY_ID, 
    Bucket: process.env.BUCKET_NAME,       
    signatureVersion: 'v4',
    region: process.env.S3_BUCKET_REGION   
});

exports.getPreSingedUrl = async (file_path, file_name, duration) => {
    const params = {
        Bucket: file_path,
        Key: file_name,
        Expires: duration
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