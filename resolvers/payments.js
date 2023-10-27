const { combineResolvers } = require('graphql-resolvers');
const {
  initializePaymentTransaction,
  getBanks,
} = require('../controllers/payments.js');
const { protectUser } = require('../middleware/auth.js');

module.exports = {
  Query: {
    payment_initializeTransaction: combineResolvers(
      protectUser,
      initializePaymentTransaction
    ),
    payment_getBanks: getBanks,
  },
};
