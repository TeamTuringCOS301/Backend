const express = require("express");
const isBase64 = require("is-base64");
const objects = require("../objects.js");

module.exports = (config, db) => {
	async function validate(info) { // TODO: proper validation
		for(let key of ["name", "description", "image"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		for(let key of ["amount", "randValue"]) {
			if(typeof info[key] !== "number") {
				return false;
			}
		}
		return isBase64(info.image);
	}

	const api = express();
	objects.addParams(api, db);

	api.get("/list", async(req, res) => {
		const rewards = await db.reward.list();
		res.send({rewards});
	});

	api.use(async(req, res, next) => {
		if("superId" in req.session) {
			req.superId = parseInt(req.session.superId);
			if(!await db.superadmin.validId(req.superId)) {
				return res.sendStatus(401);
			}
		}
		next();
	});

	api.get("/list/new", async(req, res) => {
		if(typeof req.superId !== "number") {
			return res.sendStatus(401);
		}
		const rewards = await db.reward.listNew();
		res.send({rewards});
	});

	api.post("/verify/:reward", async(req, res) => {
		if(typeof req.superId !== "number") {
			return res.sendStatus(401);
		}
		if(typeof req.body.coinValue !== "number" || req.body.coinValue <= 0) {
			return res.sendStatus(400);
		}
		await db.reward.verifyCoinValue(req.reward, req.body.coinValue);
		res.send({});
	});

	api.use(async(req, res, next) => {
		if("adminId" in req.session) {
			req.adminId = parseInt(req.session.adminId);
			if(await db.admin.validId(req.adminId)) {
				return next();
			}
		}
		res.sendStatus(401);
	});

	api.get("/list/own", async(req, res) => {
		const rewards = await db.reward.listOwned(req.adminId);
		res.send({rewards});
	});

	api.post("/add", async(req, res) => {
		req.body.admin = req.adminId;
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		await db.reward.add(req.body);
		res.send({});
	});

	api.get("/remove/:reward", async(req, res) => {
		if(await db.reward.getAdmin(req.reward) !== req.adminId) {
			return res.sendStatus(401);
		}
		await db.reward.remove(req.reward);
		res.send({});
	});

	return api;
};
