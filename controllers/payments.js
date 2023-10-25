const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const PaystackService = require('../services/PaystackService');

module.exports.initializePaymentTransaction = asyncHandler(
  async (_, args, context) => {
    const { channels, amount, description } = args;
    const user = await User.findById(context.user.id);

    const email = user.email;
    const metadata = {
      userId: user._id,
      description: description,
    };
    const response = await PaystackService.initialiseTransaction(
      amount,
      email,
      metadata,
      channels
    );

    return response.authorization_url;
  }
);
