const express = require("express");

module.exports = db => {
	const api = express();

	api.post("/register", async(req, res) => {
		const success = await db.registerUser(req.body);
		res.send({success});
	});

	api.post("/login", async(req, res) => {
		const success = await db.userLogin(req.body.username, req.body.password);
		res.send({success});
	});

	return api;
};
