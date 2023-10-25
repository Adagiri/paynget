const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const PaystackService = require('./services/PaystackService');
const { createWebhookHash } = require('./utils/general');

const app = express();

app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: process.env.TEST_ENV === 'false' ? true : false,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Deploying`);
});

app.post(
  '/api/paystack/transaction-completion-webhook',
  async function (req, res) {
    // Generate hash
    const hash = createWebhookHash(process.env.PAYSTACK_SECRET_KEY, req.body);

    // Compare hash
    if (hash == req.headers['x-paystack-signature']) {
      try {
        await PaystackService.handleWebhook(req.body);

        return res.sendStatus(200);
      } catch (error) {
        console.log(
          error,
          'error whilst processing paystack transactions webhook'
        );

        return res.sendStatus(500);
      }
    } else {
      return res.status(403).send('Unauthorized');
    }
  }
);

module.exports = app;
