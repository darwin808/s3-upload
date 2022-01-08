const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKETNAME;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "POST",
};

const videoRegex = /^data:video\/\w+;base64,/;

module.exports.handler = async (event) => {
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: "Successfully uploaded file to S3" }),
  };

  try {
    const parsedBody = JSON.parse(event.body);
    if (!parsedBody.file) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "No media found",
          uploadResult: "",
          uploadResult_small: "",
        }),
      };
    }
    const base64File = parsedBody.file;
    const decodedFile = Buffer.from(
      base64File.replace(videoRegex, ""),
      "base64"
    );
    const params = {
      Bucket: BUCKET_NAME,
      Key: `videos/${new Date().toISOString()}.mp4`,
      Body: decodedFile,
      ContentType: "video/mp4",
    };

    const uploadResult = await s3.upload(params).promise();

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
