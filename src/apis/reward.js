const express = require("express");
const isBase64 = require("is-base64");
const objects = require("../objects.js");

module.exports = (config, db) => {
	const auth = require("../auth.js")(db);

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

	api.get("/list/new", async(req, res) => {
		await auth.requireSuperAdmin(req);
		const rewards = await db.reward.listNew();
		res.send({rewards});
	});

	api.post("/verify/:reward", async(req, res) => {
		await auth.requireSuperAdmin(req);
		if(typeof req.body.coinValue !== "number" || req.body.coinValue <= 0) {
			return res.sendStatus(400);
		}
		await db.reward.verifyCoinValue(req.reward, req.body.coinValue);
		res.send({});
	});

	api.get("/list/own", async(req, res) => {
		await auth.requireAdmin(req);
		const rewards = await db.reward.listOwned(await db.admin.getArea(req.adminId));
		res.send({rewards});
	});

	api.post("/add", async(req, res) => {
		await auth.requireAdmin(req);
		req.body.area = await db.admin.getArea(req.adminId);
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		await db.reward.add(req.body);
		res.send({});
	});

	api.get("/remove/:reward", async(req, res) => {
		await auth.requireAreaAdmin(req, await db.reward.getArea(req.reward));
		await db.reward.remove(req.reward);
		res.send({});
	});

	return api;
};
