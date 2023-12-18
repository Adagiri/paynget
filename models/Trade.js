const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },

  chatId: {
    type: String,
    required: true,
  },

  seller: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },

  buyer: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },

  buyerDeliveryDetail: {
    type: String,
  },

  status: {
    type: String,
    enum: ['active', 'completed', 'disputed'],
  },

  amount: {
    type: Number,
    required: true,
  },

  itemDetail: {
    type: String,
    required: true,
  },

  itemCategory: {
    type: String,
    required: true,
  },

  itemImages: {
    type: [String],
    required: true,
  },

  isFunded: {
    type: Boolean,
    default: false,
  },

  fundStatus: {
    type: String,
    enum: [
      'Not_Funded_Yet',
      'Funded_By_Buyer',
      'Fund_Has_Been_Delivered_To_Seller',
      'Funds_Returned_To_Buyer',
    ],
  },

  hasBuyerJoined: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Trade', TradeSchema);
