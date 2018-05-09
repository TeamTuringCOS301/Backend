const bcrypt = require("bcrypt");
const express = require("express");

module.exports = db => {
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

	return api;
};
