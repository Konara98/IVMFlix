const AwsConfig = require('../Utils/AwsConfig');
const { readFileSync } = require('fs');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

exports.signUp = (name, email, password, agent = 'none') => {
  return new Promise((resolve) => {
    AwsConfig.initAWS();
    AwsConfig.setCognitoAttributeList(name, email, agent); 
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

exports.signIn = (email, password) => {
  return new Promise((resolve) => {
    AwsConfig.getCognitoUser(email).authenticateUser(AwsConfig.getAuthDetails(email, password), {
      onSuccess: (result) => {
        const token = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        }  
        return resolve({ statusCode: 200, response: AwsConfig.decodeJWTToken(token) });
      },
      
      onFailure: (err) => {
        return resolve({ statusCode: 400, response: err.message || JSON.stringify(err)});
      },
    });
  });
}

exports.protect = (token) => {
  const data = readFileSync('./Data/jwks.json', {encoding: 'utf8'});
  const pem = jwkToPem(JSON.parse(data));

  const auth = jwt.verify(token, pem, { algorithms: ['RS256'] });
  return auth;
}

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

exports.verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
              reject(err);
          } else {
              resolve(decoded);
          }
      });
  });
};

