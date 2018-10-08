const coins = require("./src/coins.js");
const config = require("./src/config.js");
const db = require("./src/database.js");
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const sendMail = require("./src/email.js");
const api = require("./src/app.js")(config, db, coins, sendMail);

const app = express();
app.use("/api", api);
for(let key in config.mount) {
	app.use(key, express.static(config.mount[key]));
}

https.createServer({
	cert: fs.readFileSync(config.tls.cert),
	key: fs.readFileSync(config.tls.key),
	passphrase: config.tls.passphrase
}, app).listen(443);

const redirect = express();
redirect.use((req, res) => {
	res.redirect(`https://${req.hostname}${req.url}`);
});
http.createServer(redirect).listen(80);

setInterval(() => {
	const minTime = new Date().getTime() - config.coinRewards.pointMaxAge;
	db.point.limitPoints(minTime);
}, config.coinRewards.clearInterval);
