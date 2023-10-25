const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

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
    token: authorization_code,
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
