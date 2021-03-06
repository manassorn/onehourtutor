const S3 = require('aws-sdk/clients/s3')

const conf = require('../conf/s3.json')

const accessKeyId = conf.accessKeyId
const secretAccessKey = conf.secretAccessKey
const bucketName = conf.bucketName

function s3upload(fileName, fileData) {
  return new Promise((resolve, reject) => {
    const s3 = new S3({
      accessKeyId,
      secretAccessKey
    });
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileData,
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.log('s3 error:', err);
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

module.exports.upload = (fileData) => {
  return s3upload(new Date().getTime() + '.png', fileData).then((sendData) => {
    return sendData.Location
  })
}