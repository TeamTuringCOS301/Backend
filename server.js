const coins = require("./src/coins.js");
const config = require("./src/config.js");
const db = require("./src/database.js");
const fs = require("fs");
const https = require("https");
const sendMail = require("./src/email.js");
const app = require("./src/app.js")(config, db, coins, sendMail);

https.createServer({
	cert: fs.readFileSync(config.tls.cert),
	key: fs.readFileSync(config.tls.key),
	passphrase: config.tls.passphrase
}, app).listen(config.apiPort);

setInterval(() => {
	const minTime = new Date().getTime() - config.coinRewards.pointMaxAge;
	db.point.limitPoints(minTime);
}, config.coinRewards.clearInterval);
