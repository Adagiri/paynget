const AWS = require('aws-sdk');

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
};

const ses = new AWS.SES({
  region: 'us-east-1',
  credentials,
});

var s3 = new AWS.S3({
  credentials,
});

const retrieveFile = async (key, bucket) => {
  var params = {
    Bucket: bucket,
    Key: key,
  };
  const file = await s3.getObject(params).promise();

  return file;
};

module.exports = {
  ses,
  retrieveFile,
};
