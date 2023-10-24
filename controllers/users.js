const asyncHandler = require('../middleware/async');
const User = require('../models/User');
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
  const user = await User.findById(context.user.id).populate('activeAccount');

  return user;
});

module.exports.deleteUserByEmail = asyncHandler(async (_, args, context) => {
  const user = await User.findOne({ email: args.email, isEmailVerified: true });

  if (!user) {
    return new ErrorResponse(404, `User with email ${args.email} not found`);
  }
console.log(typeof process.env.TEST_ENV)
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
