const bcrypt = require("bcrypt");
const express = require("express");
const objects = require("../objects.js");

module.exports = (config, db) => {
	const auth = require("../auth.js")(db);

	async function validate(info) { // TODO: proper validation
		for(let key of ["username", "email", "password", "name", "surname", "walletAddress"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return true;
	}

	const api = express();
	objects.addParams(api, db);

	api.post("/add", async(req, res) => {
		if(!await validate(req.body)) {
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
		let success = false;
		const id = await db.user.find(req.body.username);
		if(id !== null) {
			const hash = await db.user.getPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.userId = id;
				success = true;
			}
		}
		res.send({success});
	});

	api.get("/logout", async(req, res) => {
		await auth.requireUser(req);
		req.session.userId = undefined;
		res.send({});
	});

	api.get("/info", async(req, res) => {
		await auth.requireUser(req);
		res.send(await db.user.getInfo(req.userId));
	});

	api.post("/info", async(req, res) => {
		await auth.requireUser(req);
		await db.user.updateInfo(req.userId, req.body);
		res.send({});
	});

	api.post("/password", async(req, res) => {
		await auth.requireUser(req);
		if(typeof req.body.old !== "string" || typeof req.body.new !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.user.getPassword(req.userId);
		if(await bcrypt.compare(req.body.old, hash)) {
			hash = await bcrypt.hash(req.body.new, 10);
			await db.user.setPassword(req.userId, hash);
			success = true;
		}
		res.send({success});
	});

	api.post("/remove", async(req, res) => {
		await auth.requireUser(req);
		if(typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.user.getPassword(req.userId);
		if(await bcrypt.compare(req.body.old, hash)) {
			await db.user.remove(req.userId);
			req.session.userId = undefined;
			success = true;
		}
		res.send({success});
	});

	return api;
};
