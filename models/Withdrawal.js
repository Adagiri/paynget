const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  amount: {
    type: String,
    trim: true,
  },

  reference: {
    type: String,
    required: true,
  },

  paymentHandler: {
    type: String,
    enum: ['Paystack'],
    default: 'Paystack',
  },

  accountDetails: {
    bank_code: String,
    account_number: String,
    account_name: String,
    bank_name: String,
  },

  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
