const mongoose = require('mongoose');

const WebhookErrorSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },

  error: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  reference: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WebhookError', WebhookErrorSchema);
