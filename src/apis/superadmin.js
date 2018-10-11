const bcrypt = require("bcrypt");
const express = require("express");
const generator = require("generate-password");
const objects = require("../objects.js");
const validator = require("../validate.js");

module.exports = (config, db, coins, sendMail) => {
	const auth = require("../auth.js")(db);

	async function validate(info, initial = true) {
		return (!initial || validator.validateUsername(info.username))
			&& validator.validateEmail(info.email)
			&& validator.validateName(info.name)
			&& validator.validateName(info.surname);
	}

	const api = express();
	objects.addParams(api, db);

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

	api.get("/logout", async(req, res) => {
		await auth.requireSuperAdmin(req);
		delete req.session.superId;
		res.send({});
	});

	api.get("/info", async(req, res) => {
		await auth.requireSuperAdmin(req);
		res.send(await db.superadmin.getInfo(req.superId));
	});

	api.post("/update", async(req, res) => {
		await auth.requireSuperAdmin(req);
		if(!await validate(req.body, false)) {
			return res.sendStatus(400);
		}
		await db.superadmin.updateInfo(req.superId, req.body);
		res.send({});
	});

	api.post("/password", async(req, res) => {
		await auth.requireSuperAdmin(req);
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

	/* These routes are not currently used by the front-end.
	 * Since these are privileged actions, rather disable them for now.

	api.post("/add", async(req, res) => {
		await auth.requireSuperAdmin(req);
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
		await auth.requireSuperAdmin(req);
		if(req.superadmin === req.superId) {
			return res.sendStatus(400);
		}
		await db.superadmin.remove(req.superadmin);
		res.send({});
	});

	api.get("/list", async(req, res) => {
		await auth.requireSuperAdmin(req);
		res.send({admins: await db.superadmin.list()});
	});

	*/

	return api;
};
