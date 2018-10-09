const coins = require("./src/coins.js");
const config = require("./src/config.js");
const db = require("./src/database.js");
const express = require("express");
const fs = require("fs");
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
}, app).listen(config.ports.https, () => {
	const redirect = express();
	redirect.use((req, res) => {
		res.redirect(`https://${req.hostname}${req.url}`);
	});
	redirect.listen(config.ports.http, () => {
		if(config.user !== null) {
			process.setgroups([]);
			process.setgid(config.user.gid);
			process.setuid(config.user.uid);
		}
	});
});

setInterval(() => {
	const minTime = new Date().getTime() - config.coinRewards.pointMaxAge;
	db.point.limitPoints(minTime);
}, config.coinRewards.clearInterval);
