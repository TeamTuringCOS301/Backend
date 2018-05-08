const express = require("express");

module.exports = db => {
	const api = express();

	api.post("/register", async(req, res) => {
		try {
			const success = await db.registerUser(req.body);
			res.send({success});
		} catch(err) {
			res.status(500).send({});
		}
	});

	api.post("/login", async(req, res) => {
		try {
			const success = await db.userLogin(req.body.username, req.body.password);
			res.send({success});
		} catch(err) {
			res.status(500).send({});
		}
	});

	return api;
};
