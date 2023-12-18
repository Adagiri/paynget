const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const PaystackService = require('../services/PaystackService');
const {
  generateRandomNumbers,
  decryptWalletBalance,
  decrypt,
  encryptNewWalletBalance,
} = require('../utils/general');
const { ErrorResponse, SuccessResponse } = require('../utils/responses');
const Transaction = require('../models/Transaction');

module.exports.getAllUsers = asyncHandler(async (_, args) => {
  const { filter, sort, skip, limit } = getQueryArguments(args);

  let users = await User.find(filter).sort(sort).skip(skip).limit(limit);

  users = users.map((user) => {
    user.id = user._id;
    user.walletBalance = decryptWalletBalance(user.walletBalance);

    return user;
  });

  return users;
});

module.exports.getUserById = asyncHandler(async (_, args) => {
  const user = await User.findById(args.userId);

  if (!user) {
    return new ErrorResponse(400, `User with id: ${args.userId} not found`);
  }

  user.walletBalance = decryptWalletBalance(user.walletBalance);

  return user;
});

module.exports.getLoggedInUser = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);
  user.walletBalance = decryptWalletBalance(user.walletBalance);

  return user;
});

module.exports.deleteUserByEmail = asyncHandler(async (_, args, context) => {
  const user = await User.findOne({ email: args.email, isEmailVerified: true });

  if (!user) {
    return new ErrorResponse(404, `User with email ${args.email} not found`);
  }
  console.log(typeof process.env.TEST_ENV);
  if (process.env.TEST_ENV === 'true') {
    await user.remove();
  }

  return new SuccessResponse(200, true);
});

module.exports.deleteUser = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);

  await user.remove();

  return new SuccessResponse(200, true);
});

module.exports.editUser = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);

  user.name = args.name;
  user.phone = args.phone;
  args.dob && (user.dob = args.dob);

  await user.save();
  user.walletBalance = decryptWalletBalance(user.walletBalance);

  return new SuccessResponse(200, true, user);
});

module.exports.addBank = asyncHandler(async (_, args, context) => {
  const { bankCode, accountNumber, bankName } = args;

  const user = await User.findById(context.user.id);
  const bankExists = user.banks.find(
    (bank) => bank.accountNumber === accountNumber && bank.bankCode === bankCode
  );

  if (bankExists) {
    return new ErrorResponse(400, 'Bank already exists');
  }

  const bankDetails = await PaystackService.getAccountDetail({
    account_number: accountNumber,
    bank_code: bankCode,
  });

  const bank = {
    bankName,
    bankCode,
    accountNumber,
    accountName: bankDetails.account_name,
  };

  user.banks.push(bank);
  await user.save();
  user.walletBalance = decryptWalletBalance(user.walletBalance);

  return new SuccessResponse(200, true, user);
});

module.exports.deleteBank = asyncHandler(async (_, args, context) => {
  const { bankId } = args;

  const user = await User.findById(context.user.id);

  user.banks = user.banks.filter((bank) => String(bank._id) !== bankId);
  await user.save();
  user.walletBalance = decryptWalletBalance(user.walletBalance);

  return new SuccessResponse(200, true, user);
});

module.exports.triggerAddCard = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);
  const amountToKobo = 100 * 100; // 100 NGN to kobo
  const response = {
    name: user.name,
    transactionAmountInKobo: amountToKobo,
    ppc: 0,
    email: user.email,
    description: 'Add_Card',
    reference: generateRandomNumbers(20),
    channels: ['card'],
    metadata: {
      userId: user._id,
      description: 'Add_Card',
      amount: 100,
    },
  };

  return response;
});

module.exports.deleteCard = asyncHandler(async (_, args, context) => {
  const { cardId } = args;

  const user = await User.findById(context.user.id);

  user.cards = user.cards.filter((card) => String(card._id) !== cardId);
  await user.save();
  user.walletBalance = decryptWalletBalance(user.walletBalance);

  return new SuccessResponse(200, true, user);
});

module.exports.triggerWalletTopup = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);
  let amount = args.amount;

  const paymentProviderCharge = PaystackService.calculatePaystackCharge(amount);
  let totalAmount = amount + paymentProviderCharge;

  totalAmount = Math.ceil(totalAmount * 100); // Converted to kobo

  const response = {
    name: user.name,
    transactionAmountInKobo: totalAmount,
    ppc: Math.ceil(paymentProviderCharge),
    email: user.email,
    description: 'Topup_Wallet',
    reference: generateRandomNumbers(20),
    channels: ['card', 'bank_transfer'],
    metadata: {
      userId: user._id,
      description: 'Topup_Wallet',
      amount: amount,
    },
  };

  return response;
});

module.exports.topupWalletViaSavedCard = asyncHandler(
  async (_, args, context) => {
    const user = await User.findById(context.user.id);
    let amount = args.amount;
    const cardId = args.cardId;

    const card = user.cards.find((card) => String(card._id) === cardId);

    if (!card) {
      return new ErrorResponse(404, `Card with id '${cardId}' not found`);
    }

    const paymentProviderCharge =
      PaystackService.calculatePaystackCharge(amount);
    let totalAmount = Math.ceil(amount + paymentProviderCharge);
    const cardAuthorizationToken = decrypt(card.token);

    const charge = await PaystackService.chargeCard({
      amount: totalAmount,
      email: user.email,
      cardAuthorizationToken: cardAuthorizationToken,
    });

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Save transaction
      await Transaction.create(
        [
          {
            user: user._id,
            amount: amount,
            transactionAmount: charge.amount,
            channel: 'card',
            reference: charge.reference,
            description: 'Topup_Wallet',
            paymentHandler: 'Paystack',
          },
        ],
        { session }
      );

      const encryptedBalance = user.walletBalance;
      const increment = amount;
      user.walletBalance = encryptNewWalletBalance(encryptedBalance, increment);
      await user.save({ session });
    });

    session.endSession();

    user.walletBalance = decrypt(user.walletBalance);
    return new SuccessResponse(200, true, user);
  }
);
