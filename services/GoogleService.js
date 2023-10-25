const admin = require('firebase-admin');
const fs = require('fs').promises;
const { retrieveFile } = require('./AwsService');

module.exports.initializeFirebaseAdmin = async () => {
  const serviceAccount = await getFirebaseAdminConfig();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

const getFirebaseAdminConfig = async () => {
  let config = null;
  try {
    const fileString = await fs.readFile(
      'config/firebase_admin_config.json',
      'utf8'
    );
    config = JSON.parse(fileString);
  } catch (error) {
    const fileResponse = await retrieveFile(
      'payget-firebase-admin-sdk-config.json',
      'payget-app-secrets'
    );
    const buffer = fileResponse.Body;
    const fileString = buffer.toString('utf8');
    config = JSON.parse(fileString);
    await saveFirebaseAdminConfig(fileString);
  }
  return config;
};

const saveFirebaseAdminConfig = async (fileString) => {
  try {
    await fs.writeFile('config/firebase_admin_config.json', fileString);
  } catch (error) {
    console.log(error, 'error occured whilst saving config file');
  }
};

module.exports.getFirebaseAdminConfig = getFirebaseAdminConfig;
