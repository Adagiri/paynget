const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
  },

  amount: {
    type: Number,
    required: true,
  },

  transactionAmount: {
    type: Number,
    required: true,
  },

  channel: {
    type: String,
    enum: ['card', 'bank_transfer'],
    required: true,
  },

  reference: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  paymentHandler: {
    type: String,
    enum: ['Paystack'],
    default: 'Paystack',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
/*
description = ['Add_Card', 'Topup_Wallet']
*/
module.exports = mongoose.model('Transaction', TransactionSchema);
