const bcrypt = require("bcrypt");
const express = require("express");
const generator = require("generate-password");

module.exports = (config, db) => {
	async function validate(info) { // TODO: proper validation
		for(let key of ["username", "email", "name", "surname"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return true;
	}

	const api = express();

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		const id = await db.superadmin.find(req.body.username);
		if(id !== null) {
			const hash = await db.superadmin.getPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.superId = id;
				success = true;
			}
		}
		res.send({success});
	});

	api.use(async(req, res, next) => {
		if("superId" in req.session) {
			req.superId = parseInt(req.session.superId);
			if(await db.superadmin.validId(req.superId)) {
				return next();
			}
		}
		res.sendStatus(401);
	});

	api.get("/logout", async(req, res) => {
		req.session.superId = undefined;
		res.send({});
	});

	api.get("/info", async(req, res) => {
		res.send(await db.superadmin.getInfo(req.superId));
	});

	api.post("/info", async(req, res) => {
		await db.superadmin.updateInfo(req.superId, req.body);
		res.send({});
	});

	api.post("/password", async(req, res) => {
		if(typeof req.body.old !== "string" || typeof req.body.new !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.superadmin.getPassword(req.superId);
		if(await bcrypt.compare(req.body.old, hash)) {
			hash = await bcrypt.hash(req.body.new, 10);
			await db.superadmin.setPassword(req.superId, hash);
			success = true;
		}
		res.send({success});
	});

	api.post("/add", async(req, res) => {
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		if(await db.superadmin.find(req.body.username) === null) {
			const password = generator.generate();
			req.body.password = await bcrypt.hash(password, 10);
			await db.superadmin.add(req.body);
			return res.send({success: true, password});
		}
		res.send({success: false});
	});

	api.get("/remove/:superadmin", async(req, res) => {
		if(req.id === req.superId) {
			return res.sendStatus(400);
		}
		await db.superadmin.remove(req.superadmin);
		res.send({});
	});

	api.get("/list", async(req, res) => {
		res.send({admins: await db.superadmin.list()});
	});

	return api;
};
