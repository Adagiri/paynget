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
const { processAddCard } = require('../controllers/webhooks');

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

module.exports.createTransferRecipient = async (
  name,
  account_number,
  bank_code,
  metadata
) => {
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

    return response.data.data.recipient_code;
  } catch (error) {
    console.log('Error Occured Whilst Creating Transfer Recipient: ', error);
    throw error.response?.data.message;
  }
};

module.exports.disburseSingle = async (amount, reason, recipient) => {
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

module.exports.handleWebhook = async (payload) => {
  let { event, data } = payload;

  console.log(event, 'event');
  console.log(data, 'data');

  // Convert from kobo to naira (Amount from paystack is in -kobo-)
  const transactionAmount = Number(data.amount) / 100;
  const metadata = data.metadata;
  // Successful paystack transaction (card or transfer)
  if (event === 'charge.success') {
    if (metadata && metadata.description === 'Add_Card')
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
};
