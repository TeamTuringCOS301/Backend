const admin = require("./admin-api.js");
const area = require("./area-api.js");
const config = require("./config.js");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const user = require("./user-api.js");
require("express-async-errors");

module.exports = db => {
	const app = express();
	app.use(cors());
	app.use(express.json());
	app.use(session({ // TODO: set cookie.maxAge and cookie.secure
		resave: false,
		saveUninitialized: false,
		secret: config.cookieSecret,
		store: db.sessionStore
	}));

	app.use("/admin", admin(db));
	app.use("/area", area(db));
	app.use("/user", user(db));

	app.use((err, req, res, next) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
};
