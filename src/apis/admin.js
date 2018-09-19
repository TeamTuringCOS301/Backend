const bcrypt = require("bcrypt");
const express = require("express");
const generator = require("generate-password");
const objects = require("../objects.js");
const validator = require("../validate.js")

module.exports = (config, db, coins, sendMail) => {
	const auth = require("../auth.js")(db);

	async function validate(info, initial = true) {
		if(initial) {
			if(!validator.validateUsername(info.username)) {
				return false;
			}
		}
		if(!validator.validateEmail(info.email) || !validator.validateName(info.name) || !validator.validateName(info.surname)){
			return false;
		}
		return !initial || typeof info.area === "number" && await db.area.validId(info.area);
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

	api.get("/logout", async(req, res) => {
		await auth.requireAdmin(req);
		delete req.session.adminId;
		res.send({});
	});

	api.get("/info", async(req, res) => {
		await auth.requireAdmin(req);
		res.send(await db.admin.getInfo(req.adminId));
	});

	api.post("/update", async(req, res) => {
		await auth.requireAdmin(req);
		if(!await validate(req.body, false)) {
			return res.sendStatus(400);
		}
		await db.admin.updateInfo(req.adminId, req.body);
		res.send({});
	});

	api.post("/password", async(req, res) => {
		await auth.requireAdmin(req);
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

	api.post("/add", async(req, res) => {
		await auth.requireSuperAdmin(req);
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		if(await db.admin.find(req.body.username) === null) {
			const password = generator.generate();
			req.body.password = await bcrypt.hash(password, 10);
			await db.admin.add(req.body);
			const areaInfo = await db.area.getInfo(req.body.area);
			await sendMail(req.body, "ERP-Coin Conservation Area Admin",
				`You have been added as a conservation area admin for ${areaInfo.name}.\n\n`
					+ "Your details for the admin portal are:\n"
					+ `Username: ${req.body.username}\n`
					+ `Password: ${password}\n`
					+ "Please change your password as soon as possible.");
			return res.send({success: true});
		}
		res.send({success: false});
	});

	api.get("/remove/:admin", async(req, res) => {
		await auth.requireSuperAdmin(req);
		await db.admin.remove(req.admin);
		res.send({});
	});

	api.get("/list", async(req, res) => {
		await auth.requireSuperAdmin(req);
		res.send({admins: await db.admin.list()});
	});

	return api;
};
