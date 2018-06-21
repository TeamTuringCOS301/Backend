const admin = require("./admin-api.js");
const area = require("./area-api.js");
const cors = require("cors");
const express = require("express");
const point = require("./point-api.js");
const session = require("express-session");
const reward = require("./reward-api.js");
const user = require("./user-api.js");
require("express-async-errors");

module.exports = (config, db) => {
	const app = express();
	app.use(cors({origin: true, credentials: true}));
	app.use(express.json());
	app.use(session({ // TODO: set cookie.maxAge and cookie.secure
		resave: false,
		saveUninitialized: false,
		secret: config.cookieSecret,
		store: db.sessionStore
	}));

	if(!db.disableLogging) {
		app.use((req, res, next) => {
			console.log(`${req.method} ${req.path}`);
			console.log(req.body);
			next();
		});
	}

	app.use("/admin", admin(db));
	app.use("/area", area(db));
	app.use("/point", point(db));
	app.use("/reward", reward(db));
	app.use("/user", user(db));

	app.use((err, req, res, next) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
};
