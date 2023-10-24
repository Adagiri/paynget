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
