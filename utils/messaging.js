const { ses } = require('../services/AwsService');

const generateEmailArguments = (from, to, subject, message) => {
  const mainEmail = process.env.MAIN_EMAIL;

  if (!from) {
    from = `Payget <${mainEmail}>`;
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
    ReplyToAddresses: ['no-reply@payget.com'],
  };
};

const sendEmail = (params) => {
  return ses.sendEmail(params).promise();
};

module.exports = {
  sendEmail,
  generateEmailArguments,
};
