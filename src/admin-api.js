const bcrypt = require("bcrypt");
const express = require("express");

module.exports = db => {
	const api = express();

	api.post("/register", async(req, res) => {
		if(!await db.verifyAdmin(req.body)) {
			return res.sendStatus(400);
		}
		req.body.password = await bcrypt.hash(req.body.password, 10);
		const id = await db.addAdmin(req.body);
		let success = false;
		if(id !== null) {
			req.session.adminId = id + 1;
			success = true;
		}
		res.send({success});
	});

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		const id = await db.findAdmin(req.body.username);
		let success = false;
		if(id !== null) {
			const hash = await db.getAdminPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.adminId = id;
				success = true;
			}
		}
		res.send({success});
	});

	api.use((req, res, next) => {
		if(typeof req.session.adminId === "number") {
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.get("/test", (req, res) => {
		res.send("hello, world");
	});

	return api;
};
