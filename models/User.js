const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  walletBalance: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function (value) {
        // Regular expression for basic email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
      },
      message: 'Invalid email format',
    },
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  password: {
    type: String,
    required: true,
  },

  oldPasswords: {
    type: [String],
  },

  address: {
    type: String,
    required: true,
  },

  dob: {
    type: Date,
  },

  pin: {
    type: String,
  },

  oldPins: {
    type: [String],
  },

  isPinSet: {
    type: Boolean,
    default: false,
  },

  cards: [
    {
      expMonth: String,
      expYear: String,
      brand: String,
      token: String,
      email: String,
      bin: String,
      last4: String,
    },
  ],

  banks: [
    {
      accountNumber: String,
      accountName: String,
      bankCode: String,
      bankName: String,
    },
  ],

  signupCode: String,
  signupToken: String,
  signupTokenExpiry: Date,

  loginCode: String,
  loginToken: String,
  loginTokenExpiry: Date,

  resetPinCode: String,
  resetPinToken: String,
  resetPinTokenExpiry: Date,

  resetPasswordCode: String,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
