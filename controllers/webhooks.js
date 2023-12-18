const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const {
  decryptWalletBalance,
  encrypt,
  encryptNewWalletBalance,
} = require('../utils/general');

const extractCardDetails = ({
  exp_month,
  exp_year,
  brand,
  authorization_code,
  bin,
  last4,
}) => {
  return {
    expMonth: exp_month,
    expYear: exp_year,
    brand: brand,
    token: encrypt(authorization_code),
    bin: bin,
    last4: last4,
  };
};

const checkIfCardExists = (card, cards) => {
  const existingCard = cards.find(
    (cd) =>
      cd.bin === card.bin &&
      cd.last4 === card.last4 &&
      cd.brand === card.brand &&
      cd.expMonth === card.expMonth &&
      cd.expYear === card.expYear
  );
  if (existingCard) {
    console.log('card exists');
    return true;
  } else {
    return false;
  }
};

module.exports.processAddCard = async ({
  metadata,
  reference,
  transactionAmount,
  authorization,
  channel,
}) => {
  // Start a Mongoose session to handle transactions
  const session = await mongoose.startSession();

  try {
    // Get the user
    const userId = metadata.userId;
    const user = await User.findById(userId);

    // Use a Mongoose session to ensure transactional integrity
    await session.withTransaction(async () => {
      // Save card
      if (authorization.authorization_code && authorization.reusable) {
        const card = extractCardDetails(authorization);
        card.email = user.email;

        const cardExists = checkIfCardExists(card, user.cards);

        if (!cardExists) {
          user.cards.push(card);
          await user.save({ session });
        }
      }

      // Save transaction
      await Transaction.create(
        [
          {
            user: userId,
            amount: transactionAmount,
            transactionAmount: transactionAmount,
            channel: channel,
            reference: reference,
            description: metadata.description,
            paymentHandler: 'Paystack',
          },
        ],
        { session }
      );
    });
  } catch (error) {
    // Log and rethrow any errors
    console.log(
      error,
      'Error occurred while processing Add_Card transaction webhook'
    );

    throw error;
  } finally {
    // End the Mongoose session
    session.endSession();
  }
};

module.exports.processTopupWallet = async ({
  metadata,
  reference,
  transactionAmount,
  channel,
}) => {
  // Start a Mongoose session to handle transactions
  const session = await mongoose.startSession();

  try {
    // Confirm that transaction have not been handled before
    const transaction = await Transaction.findOne({ reference: reference });
    if (transaction) {
      return;
    }
    // Get the user
    const amount = metadata.amount;
    const userId = metadata.userId;
    const user = await User.findById(userId);

    const currentEncryptedWalletBalance = user.walletBalance;
    const walletIncrement = amount;
    const encryptedWalletBalance = encryptNewWalletBalance(
      currentEncryptedWalletBalance,
      walletIncrement
    );

    // Use a Mongoose session to ensure transactional integrity
    await session.withTransaction(async () => {
      // Save transaction
      await Transaction.create(
        [
          {
            user: userId,
            amount: amount,
            transactionAmount: transactionAmount,
            channel: channel,
            reference: reference,
            description: metadata.description,
            paymentHandler: 'Paystack',
          },
        ],
        { session }
      );

      user.walletBalance = encryptedWalletBalance;
      await user.save({ session });
    });
  } catch (error) {
    // Log and rethrow any errors
    console.log(
      error,
      'Error occurred while processing Topup_Wallet transaction webhook'
    );

    throw error;
  } finally {
    // End the Mongoose session
    session.endSession();
  }
};

module.exports.processDisbursementFromWallet = async ({
  metadata,
  reference,
  transactionAmount,
  transactionDate,
  accountDetails,
}) => {
  const session = await mongoose.startSession();

  try {
    const userId = metadata.userId;
    const user = await user.findById(userId);

    const currentEncryptedWalletBalance = user.walletBalance;
    const walletIncrement = -amount; // decrement
    const encryptedWalletBalance = encryptNewWalletBalance(
      currentEncryptedWalletBalance,
      walletIncrement
    );
    user.walletBalance = encryptedWalletBalance;

    await session.withTransaction(async () => {
      await user.save({ session });

      await PendingWithdrawal.deleteMany({ user: userId }, { session });

      const withdrawalTransaction = new Withdrawal({
        user: userId,
        amount: transactionAmount,
        reference: reference,
        paymentHandler: 'Paystack',
        accountDetails: accountDetails,
        transactionDate: transactionDate,
      });
      await withdrawalTransaction.save({ session });
    });
  } catch (error) {
    // Log and rethrow any errors
    console.log(
      error,
      'Error occurred while processing disbursement transaction webhook'
    );

    throw error;
  } finally {
    // End the Mongoose session
    session.endSession();
  }
};
