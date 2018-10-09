const coins = require("./src/coins.js");
const config = require("./src/config.js");
const db = require("./src/database.js");
const express = require("express");
const fs = require("fs");
const https = require("https");
const onExit = require("./src/on-exit.js");
const sendMail = require("./src/email.js");
const api = require("./src/app.js")(config, db, coins, sendMail);

const app = express();
app.use("/api", api);
for(let key in config.mount) {
	app.use(key, express.static(config.mount[key]));
}

const httpsServer = https.createServer({
	cert: fs.readFileSync(config.tls.cert),
	key: fs.readFileSync(config.tls.key),
	passphrase: config.tls.passphrase
}, app).listen(config.ports.https, () => {
	onExit(() => httpsServer.close(() => db.sessionStore.close()));

	const redirect = express();
	redirect.use((req, res) => {
		res.redirect(`https://${req.hostname}${req.url}`);
	});
	const httpServer = redirect.listen(config.ports.http, () => {
		onExit(() => httpServer.close());
		if(config.user !== null) {
			process.setgroups([]);
			process.setgid(config.user.gid);
			process.setuid(config.user.uid);
		}
	});
});

const timer = setInterval(() => {
	const minTime = new Date().getTime() - config.coinRewards.pointMaxAge;
	db.point.limitPoints(minTime);
}, config.coinRewards.clearInterval);
onExit(() => clearInterval(timer));
