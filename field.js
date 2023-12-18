try {
  await processTopupWallet({
    metadata: data.metadata,
    reference: data.reference,
    transactionAmount: transactionAmount,
    authorization: data.authorization,
    channel: data.channel,
  });
} catch (error) {
  const subject = 'Error During Wallet Topup Processing';

  // Save error to DB
  await WebhookError.create({
    subject: subject,
    error: error,
    type: 'Withdraw_From_Wallet_To_Bank',
    reference: data.reference,
  });

  // Send email to developers
  await sendErrorToDeveloper({
    subject: subject,
    error: error,
  });

  throw error;
}
