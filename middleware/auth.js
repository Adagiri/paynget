const { skip } = require('graphql-resolvers');
const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('../utils/responses');
const User = require('../models/User');

async function getUserInfo(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (payload) {
      return payload;
    }
    return null;
  } catch (error) {
    console.log(error, 'error whilst verifying jwttoken');
  }
}

async function protectUser(_, __, context) {
  const user = await User.findById(context.user?.id).select(
    'name email phone pin isPinSet'
  );
  if (!user) {
    return new ErrorResponse(401, 'Please login to continue');
  }

  context.user = user;
  context.user.id = user._id;

  return skip;
}

function authorize(...roles) {
  return (_, __, context) => {
    if (!roles.includes(context.user.role)) {
      return new ErrorResponse(
        403,
        'You are not authorized to perform this action'
      );
    }

    return skip;
  };
}

module.exports = {
  protectUser,
  authorize,
  getUserInfo,
};
