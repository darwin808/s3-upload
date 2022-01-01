const AWS = require("aws-sdk");
const sharp = require("sharp");
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKETNAME;

const downsizeProfileImgForTweet = (img) => {
  let imgBuffer = Buffer.from(img, "base64");
  sharp(imgBuffer)
    .resize(52, 52)
    .then((data) => {
      console.log(data, "99999999999999999999999");
      console.log("success");
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
    const decodedFile2 = downsizeProfileImgForTweet(decodedFile);

    const params = {
      Bucket: BUCKET_NAME,
      Key: `images/${new Date().toISOString()}.jpeg`,
      Body: decodedFile,
      ContentType: "image/jpeg",
    };

    console.log(decodedFile2, "2222222222222222222222222222222222222222");
    // const params2 = {
    //   Bucket: BUCKET_NAME,
    //   Key: `images/${new Date().toISOString()}.jpeg`,
    //   Body: decodedFile2,
    //   ContentType: "image/jpeg",
    // };
    const uploadResult = await s3.upload(params).promise();
    // const uploadResult2 = await s3.upload(params2).promise();

    response.body = JSON.stringify({
      message: "Successfully uploaded file to S3",
      uploadResult,
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
