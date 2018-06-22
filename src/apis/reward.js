const express = require("express");

module.exports = (db) => {
	const api = express();

	api.param("id", async(req, res, next, id) => {
		req.id = parseInt(id);
		if(isNaN(req.id) || await db.reward.find(req.id) === null) {
			res.sendStatus(400);
		} else {
			next();
		}
	});

	api.get("/list", async(req, res) => {
		const rewards = await db.reward.list();
		res.send({rewards});
	});

	api.use(async(req, res, next) => {
		if("adminId" in req.session) {
			req.adminId = parseInt(req.session.adminId);
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.post("/add", async(req, res) => {
		if(!await db.reward.verify(req.body)) {
			return res.sendStatus(400);
		}
		await db.reward.add(req.body, req.adminId);
		res.end();
	});

	api.get("/remove/:id", async(req, res) => {
		if(await db.reward.getAdmin(req.id) !== req.adminId
				&& !await db.admin.isSuperAdmin(req.adminId)) {
			return res.sendStatus(401);
		}
		await db.reward.remove(req.id);
		res.end();
	});

	api.get("/list/own", async(req, res) => {
		const rewards = await db.reward.listOwned(req.adminId);
		res.send({rewards});
	});

	api.use(async(req, res, next) => {
		if(await db.admin.isSuperAdmin(req.id)) {
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.get("/list/new", async(req, res) => {
		const rewards = await db.reward.listNew();
		res.send({rewards});
	});

	api.post("/verify/:id", async(req, res) => {
		if(typeof req.body.coinValue !== "number" || req.body.coinValue <= 0) {
			return res.sendStatus(400);
		}
		await db.reward.verifyCoinValue(req.id, req.body.coinValue);
		res.end();
	});

	return api;
};
