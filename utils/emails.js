const { sendEmail, createEmailParam } = require('./messaging');

module.exports.sendSignupVerificationEmail = async ({ email, name, code }) => {
  const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        p {
          font-size: 16px;
          color: #666;
        }
        .activation-code {
          font-size: 24px;
          font-weight: bold;
          color: #007BFF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello, ${name}!</h1>
        <p>Please use the following code to activate your account:</p>
        <p class="activation-code">${code}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Activate Your Payget Account',
      emailContent
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error);
  }
};

module.exports.sendWelcomeEmail = async ({ name, email }) => {
  const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        p {
          font-size: 18px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Payget, ${name}!</h1>
        <p>We're excited to have you. Get started and explore all that Payget has to offer.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Welcome to Payget',
      emailContent
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log('Error while sending the welcome message to the user:', error);
  }
};

module.exports.sendLoginConfirmationEmail = async ({ email, name, code }) => {
  const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        p {
          font-size: 16px;
          color: #666;
        }
        .activation-code {
          font-size: 24px;
          font-weight: bold;
          color: #007BFF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello, ${name}!</h1>
        <p>Please use the following code to confirm your Login:</p>
        <p class="activation-code">${code}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Login Confirmation Code',
      emailContent
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error);
  }
};

module.exports.sendResetPinEmail = async ({ email, name, code }) => {
  const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        p {
          font-size: 16px;
          color: #666;
        }
        .activation-code {
          font-size: 24px;
          font-weight: bold;
          color: #007BFF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello, ${name}!</h1>
        <p>Please use the following code to verify your Reset-pin request:</p>
        <p class="activation-code">${code}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Reset Your Pin',
      emailContent
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error);
  }
};

module.exports.sendResetPasswordEmail = async ({ email, name, code }) => {
  const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        p {
          font-size: 16px;
          color: #666;
        }
        .activation-code {
          font-size: 24px;
          font-weight: bold;
          color: #007BFF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello, ${name}!</h1>
        <p>Please use the following code to verify your Reset-password request:</p>
        <p class="activation-code">${code}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Reset Your Password',
      emailContent
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error);
  }
};

module.exports.sendErrorToDeveloper = async ({ subject, error }) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Boost</title>
</head>
<body>
    <p>${error}</p>
</body>
</html>`;

  try {
    const emailArgs = createEmailParam(
      null,
      'ibrahimridwan47@gmail.com',
      subject,
      message
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error whilst sending error message to developer');
  }
};

module.exports.sendNotificationEmailToAUser = async ({
  subject,
  content,
  email,
}) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learn Boost Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
      color: #555;
    }
    p {
      font-size: 16px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Important Notification</h1>
    <p>${content}</p>
    <p>If you have any questions or need assistance, please feel free to <a href="mailto:learnsmart023@gmail.com">contact us</a>. We're here to help!</p>
    <p>Best regards, <br> The Learn Boost Team</p>
  </div>
</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(null, email, subject, message);
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error whilst sending welcome message to user');
  }
};
