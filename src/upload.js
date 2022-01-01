const AWS = require("aws-sdk");
const sharp = require("sharp");
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKETNAME;

const downsizeProfileImgForTweet = async (img) => {
  // let imgBuffer = Buffer.from(img, "base64")
  return await sharp(img)
    .resize(120, 120)
    .toBuffer()
    .then((data) => {
      return data;
    })
    .catch((err) => console.log(`downisze issue ${err}`));
};

module.exports.handler = async (event) => {
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify({ message: "Successfully uploaded file to S3" }),
  };

  try {
    const parsedBody = JSON.parse(event.body);
    const base64File = parsedBody.file;
    const decodedFile = Buffer.from(
      base64File.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const decodedFile_small = await downsizeProfileImgForTweet(
      decodedFile
    ).then((e) => e);

    const params = {
      Bucket: BUCKET_NAME,
      Key: `images/${new Date().toISOString()}.jpeg`,
      Body: decodedFile,
      ContentType: "image/jpeg",
    };

    const params_small = {
      Bucket: BUCKET_NAME,
      Key: `images/${new Date().toISOString()}_small.jpeg`,
      Body: decodedFile_small,
      ContentType: "image/jpeg",
    };
    const uploadResult = await s3.upload(params).promise();
    const uploadResult_small = await s3.upload(params_small).promise();

    response.body = JSON.stringify({
      message: "Successfully uploaded file to S3",
      uploadResult,
      uploadResult_small,
    });
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: "File failed to upload",
      errorMessage: e,
    });
    response.statusCode = 500;
  }

  return response;
};
