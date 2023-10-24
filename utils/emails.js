const { sendEmail, generateEmailArguments } = require('./messaging');

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
    const emailArgs = generateEmailArguments(
      null,
      email,
      'Activate Your PaynGet Account',
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
        <h1>Welcome to PaynGet, ${name}!</h1>
        <p>We're excited to have you. Get started and explore all that PaynGet has to offer.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const emailArgs = generateEmailArguments(
      null,
      email,
      'Welcome to PaynGet',
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
    const emailArgs = generateEmailArguments(
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
    const emailArgs = generateEmailArguments(
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
    const emailArgs = generateEmailArguments(
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
