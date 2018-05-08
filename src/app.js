const admin = require("./admin-api.js");
const express = require("express");
const session = require("express-session");
const user = require("./user-api.js");
require("express-async-errors");

module.exports = db => {
	const app = express();
	app.use(express.json());
	app.use(session({ // TODO: set cookie.maxAge and cookie.secure
		resave: false,
		saveUninitialized: false,
		secret: "correcthorsebatterystaple",
		store: db.sessionStore
	}));

	app.use("/admin", admin(db));
	app.use("/user", user(db));

	app.use((err, req, res, next) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
};
