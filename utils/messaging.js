const AWS = require('aws-sdk');

const generateEmailArguments = (from, to, subject, message) => {
  const mainEmail = process.env.MAIN_EMAIL;

  if (!from) {
    from = `PaynGet <${mainEmail}>`;
  }

  return {
    Destination: {
      ToAddresses: typeof to === 'string' ? [to] : to,
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: message,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: from,
    ReplyToAddresses: ['no-reply@paynget.com'],
  };
};

const sendEmail = (params) => {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  };
  const ses = new AWS.SES({
    region: 'us-east-1',
    credentials,
  });
  return ses.sendEmail(params).promise();
};

module.exports = {
  sendEmail,
  generateEmailArguments,
};
