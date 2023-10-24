const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const {
  sendWelcomeEmail,
  sendResetPinEmail,
  sendResetPasswordEmail,
  sendLoginConfirmationEmail,
  sendSignupVerificationEmail,
} = require('../utils/emails');
const {
  confirmPin,
  confirmPassword,
  getSignedJwtToken,
  getEncryptedToken,
  generateEncryptedPin,
  generateVerificationCode,
  generateEncryptedPassword,
} = require('../utils/general');
const { ErrorResponse, SuccessResponse } = require('../utils/responses');

module.exports.sendSignupCode = asyncHandler(async (_, args, context) => {
  const existingUser = await User.findOne({
    email: args.email,
    isEmailVerified: true,
  });

  if (existingUser) {
    return new ErrorResponse(400, 'Email taken');
  } else {
    const { token, encryptedToken, tokenExpiry, code } =
      generateVerificationCode(20, 10, 6);

    const password = await generateEncryptedPassword(args.password);
    args.password = password;
    args.oldPasswords = [password];
    args.signupCode = code;
    args.signupToken = encryptedToken;
    args.signupTokenExpiry = tokenExpiry;

    const user = await User.create(args);
    await sendSignupVerificationEmail({
      email: user.email,
      name: user.name,
      code: code,
    });

    return new SuccessResponse(200, true, null, token);
  }
});

module.exports.verifySignupCode = asyncHandler(async (_, args) => {
  const encryptedToken = getEncryptedToken(args.token);

  const user = await User.findOne({
    signupToken: encryptedToken,
    isEmailVerified: false,
  });

  if (!user) {
    return new ErrorResponse(404, 'Invalid token');
  }

  if (new Date(user.signupTokenExpiry) < new Date()) {
    user.signupToken = undefined;
    user.signupCode = undefined;
    user.signupTokenExpiry = undefined;
    await user.save();

    return new ErrorResponse(404, 'Signup session expired');
  }

  if (user.signupCode !== args.code) {
    return new ErrorResponse(400, 'Incorrect code');
  }

  user.isEmailVerified = true;
  user.signupToken = undefined;
  user.signupCode = undefined;
  user.signupTokenExpiry = undefined;

  await user.save();

  const { name, email } = user;
  await sendWelcomeEmail({ name, email });
  const authToken = getSignedJwtToken(user);

  await User.deleteMany({
    email: email,
    isEmailVerified: false,
  });

  return new SuccessResponse(200, true, user, authToken);
});

module.exports.sendLoginCode = asyncHandler(async (_, args, context) => {
  const email = args.email;

  let user = await User.findOne({
    email: email,
    isEmailVerified: true,
  }).select('+password');

  if (!user) {
    return new ErrorResponse(404, 'Invalid credentials');
  }
  const isPasswordMatch = await confirmPassword(user.password, args.password);

  if (!isPasswordMatch) {
    return new ErrorResponse(404, 'Invalid credentials');
  }

  const { token, encryptedToken, tokenExpiry, code } = generateVerificationCode(
    20,
    10,
    4
  );

  user.loginCode = code;
  user.loginToken = encryptedToken;
  user.loginTokenExpiry = tokenExpiry;
  await user.save();

  await sendLoginConfirmationEmail({
    code,
    email: user.email,
    name: user.name,
  });

  return new SuccessResponse(200, true, null, token);
});

module.exports.verifyLoginCode = asyncHandler(async (_, args) => {
  const encryptedToken = getEncryptedToken(args.token);

  const user = await User.findOne({
    loginToken: encryptedToken,
  });

  if (!user) {
    return new ErrorResponse(404, 'Invalid token');
  }

  if (new Date(user.loginTokenExpiry) < new Date()) {
    user.loginToken = undefined;
    user.loginCode = undefined;
    user.loginTokenExpiry = undefined;
    await user.save();
    return new ErrorResponse(400, 'Login token expired');
  }

  if (user.loginCode !== args.code) {
    return new ErrorResponse(400, 'Incorrect code');
  }

  user.loginToken = undefined;
  user.loginCode = undefined;
  user.loginTokenExpiry = undefined;
  await user.save();
  const authToken = getSignedJwtToken(user);

  return new SuccessResponse(200, true, user, authToken);
});

module.exports.createPin = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);

  const pin = await generateEncryptedPin(args.pin);
  user.pin = pin;
  user.oldPins = [pin];
  await user.save();

  return new SuccessResponse(200, true);
});

module.exports.verifyPin = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id).select('+pin');

  const isPinCorrect = await confirmPin(user.pin, args.pin);

  if (!isPinCorrect) {
    return new ErrorResponse(400, 'Invalid Pin');
  }
  await user.save();

  return new SuccessResponse(200, true);
});

module.exports.sendResetPinCode = asyncHandler(async (_, args, context) => {
  const user = await User.findById(context.user.id);

  const { token, encryptedToken, tokenExpiry, code } = generateVerificationCode(
    20,
    10,
    4
  );

  user.resetPinToken = encryptedToken;
  user.resetPinCode = code;
  user.resetPinTokenExpiry = tokenExpiry;

  await user.save();

  await sendResetPinEmail({ name: user.name, email: user.email, code: code });

  return new SuccessResponse(200, true, null, token);
});

module.exports.verifyResetPinCode = asyncHandler(async (_, args) => {
  const encryptedToken = getEncryptedToken(args.token);

  const user = await User.findOne({
    resetPinToken: encryptedToken,
  });

  if (!user) {
    return new ErrorResponse(404, 'Invalid token');
  }

  if (new Date(user.resetPinTokenExpiry) < new Date()) {
    user.resetPinTokenExpiry = undefined;
    user.resetPinToken = undefined;
    user.resetPinCode = undefined;

    await user.save();

    return new ErrorResponse(404, 'Reset Pin session expired');
  }

  await user.save();

  if (args.code !== user.resetPinCode) {
    return new ErrorResponse(400, 'Incorrect code');
  }

  return new SuccessResponse(200, true, null, args.token);
});

module.exports.resetPin = asyncHandler(async (_, args) => {
  const encryptedToken = getEncryptedToken(args.token);

  const user = await User.findOne({
    resetPinToken: encryptedToken,
  }).select('+oldPins');

  if (!user) {
    return new ErrorResponse(404, 'Invalid token');
  }

  if (new Date(user.resetPinTokenExpiry) < new Date()) {
    user.resetPinTokenExpiry = undefined;
    user.resetPinToken = undefined;
    user.resetPinCode = undefined;

    await user.save();

    return new ErrorResponse(404, 'Reset Pin session expired');
  }

  // Handle case of old PINS being reused
  for (const pin of user.oldPins) {
    const isOldPin = await confirmPin(pin, args.pin);
    if (isOldPin) {
      return new ErrorResponse(
        400,
        "You are not allowed to set your PIN to a PIN you've used before."
      );
    }
  }
  const newPin = await generateEncryptedPin(args.pin);

  user.pin = newPin;
  user.oldPins = [...user.oldPins, newPin];
  user.resetPinTokenExpiry = undefined;
  user.resetPinToken = undefined;
  user.resetPinCode = undefined;

  await user.save();

  return new SuccessResponse(200, true);
});

module.exports.sendResetPasswordCode = asyncHandler(
  async (_, args, context) => {
    const user = await User.findOne({
      email: args.email,
      isEmailVerified: true,
    });

    if (!user) {
      return new ErrorResponse(404, `Email not registered`);
    }

    const { token, encryptedToken, tokenExpiry, code } =
      generateVerificationCode(20, 10, 4);

    user.resetPasswordToken = encryptedToken;
    user.resetPasswordCode = code;
    user.resetPasswordTokenExpiry = tokenExpiry;

    await user.save();

    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      code: code,
    });

    return new SuccessResponse(200, true, null, token);
  }
);

module.exports.verifyResetPasswordCode = asyncHandler(async (_, args) => {
  const encryptedToken = getEncryptedToken(args.token);

  const user = await User.findOne({
    resetPasswordToken: encryptedToken,
  });

  if (!user) {
    return new ErrorResponse(404, 'Invalid token');
  }

  if (new Date(user.resetPasswordTokenExpiry) < new Date()) {
    user.resetPasswordTokenExpiry = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordCode = undefined;

    await user.save();

    return new ErrorResponse(404, 'Reset Password session expired');
  }

  await user.save();

  if (args.code !== user.resetPasswordCode) {
    return new ErrorResponse(400, 'Incorrect code');
  }

  return new SuccessResponse(200, true, null, args.token);
});

module.exports.resetPassword = asyncHandler(async (_, args) => {
  const encryptedToken = getEncryptedToken(args.token);

  const user = await User.findOne({
    resetPasswordToken: encryptedToken,
  }).select('+oldPasswords');

  if (!user) {
    return new ErrorResponse(404, 'Invalid token');
  }

  if (new Date(user.resetPasswordTokenExpiry) < new Date()) {
    user.resetPasswordTokenExpiry = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordCode = undefined;

    await user.save();

    return new ErrorResponse(404, 'Reset Password session expired');
  }

  // Handle case of old PasswordS being reused
  for (const password of user.oldPasswords) {
    const isOldPassword = await confirmPassword(password, args.password);
    if (isOldPassword) {
      return new ErrorResponse(
        400,
        "You are not allowed to set your Password to a Password you've used before."
      );
    }
  }
  const newPassword = await generateEncryptedPassword(args.password);

  user.password = newPassword;
  user.oldPasswords = [...user.oldPasswords, newPassword];
  user.resetPasswordTokenExpiry = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordCode = undefined;

  await user.save();

  return new SuccessResponse(200, true);
});

module.exports.signout = asyncHandler(async (_, __, context) => {
  // Set the expiration date to a time in the past (e.g., one second ago)
  const pastExpirationDate = new Date(0);

  // Define the options with the past expiration date
  const options = {
    expires: pastExpirationDate,
    httpOnly: true,
    secure: true,
    path: '/',
  };

  // Clear the existing 'token' cookie by setting it to expire in the past
  context.res.cookie('token', '', options);

  return new SuccessResponse(200, true);
});
