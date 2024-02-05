const AWS = require('aws-sdk');
const jwt_decode = require('jwt-decode');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
let cognitoAttributeList = [];      // Initialize an array to store Cognito user attributes

// Configuration data for Cognito User Pool
const poolData = { 
    UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID,
    ClientId : process.env.AWS_COGNITO_CLIENT_ID
};

// Function to create an attribute object for Cognito user
const attributes = (key, value) => { 
  return {
    Name : key,
    Value : value
  }
};

// Function to set Cognito attribute list
function setCognitoAttributeList(name, email, agent) {
  let attributeList = [];
  attributeList.push(attributes('name',name));
  attributeList.push(attributes('email',email));

  // Convert attributes into CognitoUserAttribute and push to cognitoAttributeList
  attributeList.forEach(element => {
    cognitoAttributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(element));
  });
}

// Function to get Cognito attribute list
function getCognitoAttributeList() {
  return cognitoAttributeList;
}

// Function to get Cognito user object using email
function getCognitoUser(email) {
  const userData = {
    Username: email,
    Pool: getUserPool()
  };
  return new AmazonCognitoIdentity.CognitoUser(userData);
}

// Function to get Cognito user pool
function getUserPool(){
  return new AmazonCognitoIdentity.CognitoUserPool(poolData);
}

// Function to get authentication details
function getAuthDetails(email, password) {
  let authenticationData = {
    Username: email,
    Password: password,
   };
  return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
}

// Function to initialize AWS configuration
function initAWS (region = process.env.AWS_COGNITO_REGION, identityPoolId = process.env.AWS_COGNITO_IDENTITY_POOL_ID) {
  AWS.config.region = region;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId,
  });
}

// Function to decode JWT token
function decodeJWTToken(token) {
  const {email, exp, auth_time, token_use, sub} = jwt_decode(token.idToken);
  return {token, email, exp, uid: sub, auth_time, token_use};
}

module.exports = {
  initAWS,
  getCognitoAttributeList,
  getUserPool,
  getCognitoUser,
  setCognitoAttributeList,
  getAuthDetails,
  decodeJWTToken,
}
