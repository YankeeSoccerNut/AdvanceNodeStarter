const AWS = require("aws-sdk");
const keys = require("../config/keys");
const uuid = require("uuid/v4");
const requireLogin = require("../middlewares/requireLogin");

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
  region: "us-east-2",
  signatureVersion: "v4"
});

module.exports = app => {
  app.get("/api/upload", requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;
    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "sanderson-blog-bucket",
        ContentType: "image/jpeg",
        Key: key,
        Expires: 60
      },
      (err, url) => res.send({ key, url })
    );
  });
};
