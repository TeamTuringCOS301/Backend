const config = require("./src/config.js");
const db = require("./src/database.js");
const app = require("./src/app.js")(config, db);
const fs = require("fs");
const https = require("https");

https.createServer({
    cert: fs.readFileSync(config.tls.cert),
    key: fs.readFileSync(config.tls.key),
    passphrase: config.tls.passphrase
}, app).listen(config.apiPort);
