const express = require("express");

module.exports = db => {
	const api = express.Router();

	api.post("/login", async(req, res) => {
		const success = await db.adminLogin(req.body.username, req.body.password);
		res.send({success});
	});

	return api;
};
