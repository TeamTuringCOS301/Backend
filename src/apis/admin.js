const bcrypt = require("bcrypt");
const express = require("express");
const generator = require("generate-password");

module.exports = (db) => {
	const api = express();

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		const id = await db.admin.find(req.body.username);
		if(id !== null) {
			const hash = await db.admin.getPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				const superAdmin = await db.admin.isSuperAdmin(id);
				req.session.adminId = id;
				return res.send({success: true, superAdmin});
			}
		}
		res.send({success: false});
	});

	api.use(async(req, res, next) => {
		if("adminId" in req.session) {
			req.id = parseInt(req.session.adminId);
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.get("/logout", async(req, res) => {
		req.session.adminId = undefined;
		res.end();
	});

	api.get("/super", async(req, res) => {
		res.send({superAdmin: await db.admin.isSuperAdmin(req.id)});
	});

	api.get("/info", async(req, res) => {
		res.send(await db.admin.getInfo(req.id));
	});

	api.post("/info", async(req, res) => {
		await db.admin.updateInfo(req.id, req.body);
		res.end();
	});

	api.post("/password", async(req, res) => {
		if(typeof req.body.old !== "string" || typeof req.body.new !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.admin.getPassword(req.id);
		if(await bcrypt.compare(req.body.old, hash)) {
			hash = await bcrypt.hash(req.body.new, 10);
			await db.admin.setPassword(req.id, hash);
			success = true;
		}
		res.send({success});
	});

	api.use(async(req, res, next) => {
		if(await db.admin.isSuperAdmin(req.id)) {
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.post("/add", async(req, res) => {
		if(!await db.admin.verify(req.body)) {
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

	api.post("/remove", async(req, res) => {
		if(typeof req.body.username !== "string") {
			return res.sendStatus(400);
		}
		const id = await db.admin.find(req.body.username);
		let success = false;
		if(id !== null && !await db.admin.isSuperAdmin(id)) {
			await db.admin.remove(id);
			success = true;
		}
		res.send({success});
	});

	api.get("/list", async(req, res) => {
		res.send({admins: await db.admin.list()});
	});

	return api;
};
