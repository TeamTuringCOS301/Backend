const bcrypt = require("bcrypt");
const express = require("express");

module.exports = db => {
	const api = express();

	api.post("/add", async(req, res) => {
		if(!await db.user.verify(req.body)) {
			return res.sendStatus(400);
		}
		let success = false;
		if(await db.user.find(req.body.username) === null) {
			req.body.password = await bcrypt.hash(req.body.password, 10);
			await db.user.add(req.body);
			req.session.userId = await db.user.find(req.body.username);
			success = true;
		}
		res.send({success});
	});

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		const id = await db.user.find(req.body.username);
		let success = false;
		if(id !== null) {
			const hash = await db.user.getPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.userId = id;
				success = true;
			}
		}
		res.send({success});
	});

	// TODO: uncomment
	// api.use(async(req, res, next) => {
	// 	if(typeof req.session.userId === "string") {
	// 		req.id = parseInt(req.session.userId);
	// 		next();
	// 	} else {
	// 		res.sendStatus(401);
	// 	}
	// });

	api.get("/logout", async(req, res) => {
		req.session.userId = undefined;
		res.end();
	});

	api.get("/info", async(req, res) => {
		res.send(await db.user.getInfo(req.id));
	});

	api.post("/info", async(req, res) => {
		await db.user.updateInfo(req.id, req.body);
		res.end();
	});

	api.post("/password", async(req, res) => {
		if(typeof req.body.old !== "string" || typeof req.body.new !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.user.getPassword(req.id);
		if(await bcrypt.compare(req.body.old, hash)) {
			hash = await bcrypt.hash(req.body.new, 10);
			await db.user.setPassword(req.id, hash);
			success = true;
		}
		res.send({success});
	});

	return api;
};
