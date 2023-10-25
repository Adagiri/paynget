const mongoose = require('mongoose');

const PendingWithdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },

  reference: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('PendingWithdrawal', PendingWithdrawalSchema);
