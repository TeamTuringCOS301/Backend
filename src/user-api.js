const bcrypt = require("bcrypt");
const express = require("express");

module.exports = db => {
	const api = express();

	api.post("/register", async(req, res) => {
		if(!await db.verifyUser(req.body)) {
			return res.sendStatus(400);
		}
		req.body.password = await bcrypt.hash(req.body.password, 10);
		const id = await db.addUser(req.body);
		console.log(id);
		let success = false;
		if(id !== null) {
			req.session.userId = id + 1;
			success = true;
		}
		res.send({success});
	});

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		const id = await db.findUser(req.body.username);
		let success = false;
		if(id !== null) {
			const hash = await db.getUserPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.userId = id;
				success = true;
			}
		}
		res.send({success});
	});

	api.use((req, res, next) => {
		if(typeof req.session.userId === "number") {
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
