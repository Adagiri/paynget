const asyncHandler = require('../middleware/async');
const PendingWithdrawal = require('../models/PendingWithdrawal');
const User = require('../models/User');
const PaystackService = require('../services/PaystackService');
const { decrypt } = require('../utils/general');
const { ErrorResponse, SuccessResponse } = require('../utils/responses');

module.exports.initializePaymentTransaction = asyncHandler(
  async (_, args, context) => {
    const { channels, amount, description } = args;

    const paymentProviderCharge =
      PaystackService.calculatePaystackCharge(amount);
    let totalAmount = amount + paymentProviderCharge;
    totalAmount = Math.ceil(totalAmount);

    const user = await User.findById(context.user.id);

    const email = user.email;
    const metadata = {
      userId: user._id,
      description: description,
      amount: amount,
    };
    const response = await PaystackService.initialiseTransaction(
      totalAmount,
      email,
      metadata,
      channels
    );

    return response.authorization_url;
  }
);

module.exports.getBanks = asyncHandler(async (_, args, context) => {
  const banks = await PaystackService.getBanks();

  return banks.map((bank) => ({ name: bank.name, code: bank.code }));
});

module.exports.getPaymentCharge = asyncHandler(async (_, args, context) => {
  const amount = args.amount;
  const ppc = PaystackService.calculatePaystackCharge(amount);
  const transactionAmount = amount + ppc;

  return {
    transactionAmount: transactionAmount,
    amount: amount,
    ppc: ppc,
  };
});

module.exports.withdrawFromWalletToBank = asyncHandler(
  async (_, args, context) => {
    const amount = args.amount;
    const user = await User.findById(context.user.id);

    const walletBalance = decrypt(user.walletBalance);

    if (amount > walletBalance) {
      return new ErrorResponse(
        400,
        `Your wallet balance is ${walletBalance}. Withdrawals cannot exceed this limit.`
      );
    }

    const bank = user.banks.find(
      (bank) => String(bank._id) === String(args.bankId)
    );

    if (!bank) {
      return new ErrorResponse(404, `Bank with id ${args.bankId} not found`);
    }

    const pendingWithdrawal = await PendingWithdrawal.findOne({
      user: user._id,
    });

    if (pendingWithdrawal) {
      return new ErrorResponse(
        400,
        `
A previously initiated withdrawal request is currently in process. Please try again later.`
      );
    }

    const recipient = await PaystackService.createTransferRecipient({
      name: user.name,
      account_number: bank.accountNumber,
      bank_code: bank.bankCode,
      metadata: {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
      },
    });

    const reference = await PaystackService.disburseSingle({
      amount: amount,
      reason: 'Withdraw_From_Wallet_To_Bank',
      recipient: recipient,
    });

    await PendingWithdrawal.create({ user: user._id, reference: reference });

    return new SuccessResponse(200, true);
  }
);
