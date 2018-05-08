const express = require("express");

module.exports = db => {
	const api = express.Router();

	api.post("/login", async(req, res) => {
		try {
			const success = await db.adminLogin(req.body.username, req.body.password);
			res.send({success});
		} catch(err) {
			res.status(500).send({});
		}
	});

	return api;
};
