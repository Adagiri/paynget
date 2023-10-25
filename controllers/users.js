const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const PaystackService = require('../services/PaystackService');
const { generateRandomNumbers } = require('../utils/general');
const { ErrorResponse, SuccessResponse } = require('../utils/responses');

module.exports.getAllUsers = asyncHandler(async (_, args) => {
  const { filter, sort, skip, limit } = getQueryArguments(args);

  let users = await User.find(filter).sort(sort).skip(skip).limit(limit);

  users = users.map((user) => {
    user.id = user._id;
    return user;
  });

  return users;
});

module.exports.getUserById = asyncHandler(async (_, args) => {
  const user = await User.findById(args.userId);

  if (!user) {
    return new ErrorResponse(400, `User with id: ${args.userId} not found`);
  }

  return user;
});

module.exports.getLoggedInUser = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);
  console.log(user);
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

  return new SuccessResponse(200, true, user);
});

module.exports.deleteBank = asyncHandler(async (_, args, context) => {
  const { bankId } = args;

  const user = await User.findById(context.user.id);

  user.banks = user.banks.filter((bank) => String(bank._id) !== bankId);
  await user.save();

  return new SuccessResponse(200, true, user);
});

module.exports.triggerAddCard = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);

  const response = {
    name: user.name,
    amount: 10000, // 100 NGN to kobo
    email: user.email,
    description: 'Add_Card',
    reference: generateRandomNumbers(20),
    channels: ['card'],
    metadata: {
      userId: user._id,
      description: 'Add_Card',
    },
  };

  return response;
});

module.exports.deleteCard = asyncHandler(async (_, args, context) => {
  const { cardId } = args;

  const user = await User.findById(context.user.id);

  user.cards = user.cards.filter((card) => String(card._id) !== cardId);
  await user.save();

  return new SuccessResponse(200, true, user);
});
