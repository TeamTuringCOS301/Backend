const bcrypt = require("bcrypt");
const express = require("express");
const generator = require("generate-password");
const objects = require("../objects.js");

module.exports = (config, db) => {
	async function validate(info) { // TODO: proper validation
		for(let key of ["username", "email", "name", "surname"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return typeof info.area === "number" && await db.area.validId(info.area);
	}

	const api = express();
	objects.addParams(api, db);

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		const id = await db.admin.find(req.body.username);
		if(id !== null) {
			const hash = await db.admin.getPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.adminId = id;
				success = true;
			}
		}
		res.send({success});
	});

	api.use(async(req, res, next) => {
		if("adminId" in req.session) {
			req.adminId = parseInt(req.session.adminId);
			if(!await db.admin.validId(req.adminId)) {
				return res.sendStatus(401);
			}
		}
		next();
	});

	api.get("/logout", async(req, res) => {
		if(typeof req.adminId !== "number") {
			return res.sendStatus(401);
		}
		req.session.adminId = undefined;
		res.send({});
	});

	api.get("/info", async(req, res) => {
		if(typeof req.adminId !== "number") {
			return res.sendStatus(401);
		}
		res.send(await db.admin.getInfo(req.adminId));
	});

	api.post("/info", async(req, res) => {
		if(typeof req.adminId !== "number") {
			return res.sendStatus(401);
		}
		await db.admin.updateInfo(req.adminId, req.body);
		res.send({});
	});

	api.post("/password", async(req, res) => {
		if(typeof req.adminId !== "number") {
			return res.sendStatus(401);
		}
		if(typeof req.body.old !== "string" || typeof req.body.new !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.admin.getPassword(req.adminId);
		if(await bcrypt.compare(req.body.old, hash)) {
			hash = await bcrypt.hash(req.body.new, 10);
			await db.admin.setPassword(req.adminId, hash);
			success = true;
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

	api.post("/add", async(req, res) => {
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		if(await db.admin.find(req.body.username) === null) {
			const password = generator.generate();
			req.body.password = await bcrypt.hash(password, 10);
			await db.admin.add(req.body);
			return res.send({success: true, password});
		}
		res.send({success: false});
	});

	api.get("/remove/:admin", async(req, res) => {
		await db.admin.remove(req.admin);
		res.send({});
	});

	api.get("/list", async(req, res) => {
		res.send({admins: await db.admin.list()});
	});

	return api;
};
