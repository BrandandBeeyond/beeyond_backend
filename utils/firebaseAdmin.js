const admin = require("firebase-admin");
const serviceAccount = require("../beeyond-b3ab7-firebase-adminsdk-fbsvc-0484643cb9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
