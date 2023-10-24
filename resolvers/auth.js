const { combineResolvers } = require('graphql-resolvers');
const {
  sendLoginCode,
  sendSignupCode,
  verifyLoginCode,
  verifySignupCode,

  createPin,
  verifyPin,
  
  resetPin,
  sendResetPinCode,
  verifyResetPinCode,

  resetPassword,
  sendResetPasswordCode,
  verifyResetPasswordCode,
} = require('../controllers/auth.js');
const { protectUser } = require('../middleware/auth.js');

module.exports = {
  Mutation: {
    auth_login_sendCode: sendLoginCode,
    auth_signup_sendCode: sendSignupCode,
    auth_login_verifyCode: verifyLoginCode,
    auth_signup_verifyCode: verifySignupCode,

    auth_resetPassword: resetPassword,
    auth_resetPassword_sendCode: sendResetPasswordCode,
    auth_resetPassword_verifyCode: verifyResetPasswordCode,

    auth_pin_create: combineResolvers(protectUser, createPin),
    auth_pin_verify: combineResolvers(protectUser, verifyPin),

    auth_resetPin: combineResolvers(protectUser, resetPin),
    auth_resetPin_sendCode: combineResolvers(protectUser, sendResetPinCode),
    auth_resetPin_verifyCode: combineResolvers(protectUser, verifyResetPinCode),
  },
};
