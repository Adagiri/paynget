const { combineResolvers } = require('graphql-resolvers');
const {
  initializePaymentTransaction,
  getBanks,
  getPaymentCharge,
  withdrawFromWalletToBank,
} = require('../controllers/payments.js');
const { protectUser } = require('../middleware/auth.js');

module.exports = {
  Query: {
    payment_initializeTransaction: combineResolvers(
      protectUser,
      initializePaymentTransaction
    ),
    payment_getBanks: getBanks,
    payment_fetchCharge: getPaymentCharge,
  },

  Mutation: {
    payment_withdrawFromWalletToBank: combineResolvers(
      protectUser,
      withdrawFromWalletToBank
    ),
  },
};
