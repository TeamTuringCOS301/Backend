const admin = require("./admin-api.js");
const express = require("express");
const user = require("./user-api.js");

module.exports = db => {
	const app = express();
	app.use(express.json());

	app.use("/admin", admin(db));
	app.use("/user", user(db));

	return app;
};
