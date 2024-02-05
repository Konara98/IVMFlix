const AwsConfig = require('../Utils/AwsConfig');
const { readFileSync } = require('fs');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

/*
* Function to handle user sign up
*/
exports.signUp = (name, email, password, agent = 'none') => {
  return new Promise((resolve) => {
    AwsConfig.initAWS();      // Initialize AWS configuration
    AwsConfig.setCognitoAttributeList(name, email, agent); 

    // Perform user sign up
    AwsConfig.getUserPool().signUp(email, password, AwsConfig.getCognitoAttributeList(), null, function(err, result){
      if (err) {
        return resolve({ statusCode: 422, response: err });
      }
      const response = {
        username: result.user.name,
        userConfirmed: result.userConfirmed,
        userAgent: result.user.client.userAgent,
      }
      return resolve({ statusCode: 201, response: response });
    });
  });
}

/*
* Function to resend verification code
*/
exports.resendVerificationCode = (email) => {
  return new Promise((resolve) => {
    AwsConfig.getCognitoUser(email).resendConfirmationCode((err, result) => {
      if (err) {
        return resolve({ statusCode: 422, response: err });
      }
      return resolve({ statusCode: 200, response: result });
    });
  });
}

/*
* Function to verify user registration
*/
exports.verify = (email, code) => {
  return new Promise((resolve) => {
    AwsConfig.getCognitoUser(email).confirmRegistration(code, true, (err, result) => {
      if (err) {
        return resolve({ statusCode: 422, response: err });
      }
      return resolve({ statusCode: 200, response: result });
    });
  });
}

/*
* Function to handle user sign in
*/
exports.signIn = (email, password) => {
  return new Promise((resolve) => {
    AwsConfig.getCognitoUser(email).authenticateUser(AwsConfig.getAuthDetails(email, password), {
      onSuccess: (result) => {
        // Construct token object
        const token = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        }  
        return resolve({ statusCode: 200, response: AwsConfig.decodeJWTToken(token) });     // Decode and return JWT token
      },
      
      onFailure: (err) => {
        return resolve({ statusCode: 400, response: err.message || JSON.stringify(err)});
      },
    });
  });
}

/*
* Function to verify access token
*/
exports.protect = (token) => {
  const data = readFileSync('./Data/jwks.json', {encoding: 'utf8'});      // Read JSON Web Key Set (JWKS) from file
  const pem = jwkToPem(JSON.parse(data));                                 // Convert JSON Web Key (JWK) to PEM format

  const auth = jwt.verify(token, pem, { algorithms: ['RS256'] });         // Verify access token using PEM-formatted key
  return auth;
}

/*
* Function to handle forgotten passwords
*/
exports.forgotPassword = (email) => {
  return new Promise((resolve) => {
    AwsConfig.getCognitoUser(email).forgotPassword({
      onSuccess: (data) => {
        return resolve({ statusCode: 200, response: data });
      },
      onFailure: (err) => {
        return resolve({ statusCode: 400, response: err.message || JSON.stringify(err)});
      }
    });
  });
}

/*
* Function to reset user password
*/
exports.resetPassword = (email, verificationCode, newPassword) => {
  return new Promise((resolve) => {
    AwsConfig.getCognitoUser(email).confirmPassword(verificationCode, newPassword, {
      onSuccess: () => {
        return resolve({ statusCode: 200, response: 'Password reset successfully' });
      },
      onFailure: (err) => {
        return resolve({ statusCode: 400, response: err.message || JSON.stringify(err)});
      }
    });
  });
}
