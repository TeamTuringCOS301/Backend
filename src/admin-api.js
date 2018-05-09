const bcrypt = require("bcrypt");
const express = require("express");

module.exports = db => {
	const api = express();

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		const id = await db.admin.find(req.body.username);
		let success = false;
		if(id !== null) {
			const hash = await db.admin.getPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.adminId = id;
				success = true;
			}
		}
		res.send({success});
	});

	api.use((req, res, next) => {
		if(typeof req.session.adminId === "number") {
			req.id = req.session.adminId;
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.get("/logout", (req, res) => {
		req.session.adminId = undefined;
		res.end();
	});

	return api;
};
