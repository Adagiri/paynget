const axios = require('axios');
const {
  sendErrorToDeveloper,
  sendNotificationEmailToAUser,
} = require('../utils/emails');
const WebhookError = require('../models/WebhookError');
const {
  generateRandomString,
  generateRandomNumbers,
} = require('../utils/general');
const {
  processAddCard,
  processTopupWallet,
  processDisbursementFromWallet,
} = require('../controllers/webhooks');
const PendingWithdrawal = require('../models/PendingWithdrawal');

const transferFailureContent = (name) => `
Dear ${name},

We regret to inform you that we encountered an issue while processing your recent withdrawal request. Unfortunately, we were unable to complete the transaction at this time.

We kindly request you to initiate the withdrawal process again. If the issue persists or if you have any questions, please don't hesitate to reach out to our support team. We are here to assist you and ensure a smooth transaction experience.

Thank you for your understanding and cooperation.

Best regards,
Payget
`;

module.exports.initialiseTransaction = async (
  amount,
  email,
  metadata,
  channels
) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const amountInKobo = amount * 100;
    const data = {
      email,
      amount: amountInKobo,
      metadata: metadata ? metadata : undefined,
      channels: channels ? channels : undefined,
      reference: generateRandomNumbers(20).toString(),
    };

    const response = await axios.post(
      baseUrl + '/transaction/initialize',
      data,
      {
        headers,
      }
    );

    return response.data.data;
  } catch (error) {
    console.log('Error Occured Whilst Initiating Transaction: ', error);
    throw error.response?.data.message;
  }
};

module.exports.chargeCard = async ({
  amount,
  email,
  cardAuthorizationToken,
}) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const amountInKobo = amount * 100;
    const data = {
      authorization_code: cardAuthorizationToken,
      email: email,
      amount: amountInKobo,
      reference: generateRandomNumbers(20).toString(),
    };

    const response = await axios.post(
      baseUrl + '/transaction/charge_authorization',
      data,
      {
        headers,
      }
    );
    return response.data.data;
  } catch (error) {
    console.log('Error Occured Whilst Charging Card: ', error);
    throw error.response?.data.message;
  }
};

module.exports.createTransferRecipient = async ({
  name,
  account_number,
  bank_code,
  metadata,
}) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = process.env.PAYSTACK_BASE_URL;

  try {
    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const data = {
      type: 'nuban',
      name,
      account_number,
      bank_code,
      currency: 'NGN',
    };

    metadata && (data.metadata = metadata);

    const response = await axios.post(baseUrl + '/transferrecipient', data, {
      headers,
    });

    console.log(response.data, 'create transfer recipient response');

    return response.data.data.recipient_code;
  } catch (error) {
    console.log('Error Occured Whilst Creating Transfer Recipient: ', error);
    throw error.response?.data.message;
  }
};

module.exports.disburseSingle = async ({ amount, reason, recipient }) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const amountInKobo = amount * 100;
    const data = {
      source: 'balance',
      reason,
      amount: amountInKobo,
      recipient,
      reference: generateRandomString(20),
    };

    const response = await axios.post(baseUrl + '/transfer', data, {
      headers,
    });
    console.log(response.data, 'disbure single response');

    return response.data.data.reference;
  } catch (error) {
    console.log('Error Occured During Disbursement: ', error);

    const err = error.response?.data.message;

    if (err === 'Your balance is not enough to fulfil this request') {
      await sendErrorToDeveloper({
        subject: 'Disbursement Failed',
        error: err,
      });

      throw new Error('Please retry in 30 minutes');
    }
    throw error.response?.data.message;
  }
};

module.exports.getBanks = async () => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(baseUrl + '/bank', {
      headers,
    });

    return response.data.data;
  } catch (error) {
    console.log('Error Occured Whilst Fetching Banks: ', error);

    throw error.response?.data.message;
  }
};

module.exports.getTransferBalance = async () => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(baseUrl + '/balance', {
      headers,
    });

    return response.data.data[0].balance;
  } catch (error) {
    console.log('Error Occured Whilst Fetching Banks: ', error);

    throw error.response?.data.message;
  }
};

module.exports.getAccountDetail = async ({ account_number, bank_code }) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(
      baseUrl +
        `/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers,
      }
    );

    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.log('Error Occured Whilst Account Details: ', error);

    throw error.response?.data.message;
  }
};

module.exports.calculatePaystackCharge = function (amount) {
  const flatFee = 100;
  const decimalFee = 1.5 / 100;
  const price = amount;
  const feeCap = 2000;
  const flatFeeWaiveAmount = 2500;
  const applicableFee = decimalFee * price + flatFee;

  if (price < flatFeeWaiveAmount) {
    const finalAmount = price / (1 - decimalFee) + 0.01;
    const charge = finalAmount - price;
    return charge;
  }

  if (applicableFee > feeCap) {
    const finalAmount = price + feeCap;
    const charge = finalAmount - price;
    return charge;
  } else {
    const finalAmount = (price + flatFee) / (1 - decimalFee) + 0.01;
    const charge = finalAmount - price;
    return charge;
  }
};

module.exports.handleWebhook = async (payload) => {
  let { event, data } = payload;

  console.log(event, 'event');
  console.log(data, 'data');

  // Convert from kobo to naira (Amount from paystack is in -kobo-)
  const transactionAmount = Number(data.amount) / 100;
  const metadata = data.metadata;
  // Successful paystack transaction (card or transfer)
  if (event === 'charge.success') {
    if (metadata && metadata.description === 'Add_Card') {
      try {
        await processAddCard({
          metadata: data.metadata,
          reference: data.reference,
          transactionAmount: transactionAmount,
          authorization: data.authorization,
          channel: data.channel,
        });
      } catch (error) {
        const subject = 'Error During Card Processing';

        // Save error to DB
        await WebhookError.create({
          subject: subject,
          error: error,
          type: 'Add_Card',
          reference: data.reference,
        });

        // Send email to developers
        await sendErrorToDeveloper({
          subject: subject,
          error: error,
        });

        throw error;
      }
    }

    if (metadata && metadata.description === 'Topup_Wallet') {
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
          type: 'Topup_Wallet',
          reference: data.reference,
        });

        // Send email to developers
        await sendErrorToDeveloper({
          subject: subject,
          error: error,
        });

        throw error;
      }
    }
  }

  if (event.startsWith('transfer')) {
    const metadata = data.recipient.metadata;
    try {
      if (event === 'transfer.success') {
        await processDisbursementFromWallet({
          metadata: metadata,
          reference: data.reference,
          transactionAmount: transactionAmount,
          transactionDate: data.created_at,
          accountDetails: data.recipient.details,
        });
      }

      // Handle Transfer Failure & Refund
      if (event === 'transfer.failed' || event === 'transfer.reversed') {
        await PendingWithdrawal.deleteMany({
          user: metadata?.userId,
        });
        const subject =
          'Important: Issue with Your Recent Withdrawal Transaction';
        await sendNotificationEmailToAUser({
          subject,
          content: transferFailureContent(metadata?.userName),
          email: metadata?.userEmail,
        });
      }
    } catch (error) {
      const subject = 'Error During Processing of Disbursement Transaction';

      // Save error to DB
      await WebhookError.create({
        subject: subject,
        error: error,
        type: 'DisbursementTransaction',
        reference: data.reference,
      });

      // Send email to developers
      await sendErrorToDeveloper({
        subject: subject,
        error: error,
      });

      throw error;
    }
  }
};
