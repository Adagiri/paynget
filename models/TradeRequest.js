const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },

  seller: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  buyer: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  trade: {
    type: mongoose.Types.ObjectId,
    ref: 'Trade',
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Trade', TradeSchema);
