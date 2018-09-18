const express = require("express");
const imageType = require("image-type");
const objects = require("../objects.js");
const sendMail = require("../email.js");
const validator = require("../validate.js");

module.exports = (config, db, coins) => {
	const auth = require("../auth.js")(db);

	async function validate(info, initial = true) {
		for(let key of ["name", "description"]) {
			if(!validator.validateText(info[key])) {
				return false;
			}
		}
		for(let key of ["amount", "randValue"]) {
			if(typeof info[key] !== "number") {
				return false;
			}
		}
		if(info.randValue <= 0 || info.amount <= 0 && info.amount !== -1
				|| !Number.isInteger(info.amount)) {
			return false;
		}
		return !initial && !info.image || typeof info.image === "string"
			&& imageType(Buffer.from(info.image, "base64")) !== null;
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

	api.get("/image/:reward", async(req, res) => {
		const image = await db.reward.getImage(req.reward);
		res.set('Content-Type', imageType(image).mime);
		res.send(image);
	});

	api.post("/verify/:reward", async(req, res) => {
		await auth.requireSuperAdmin(req);
		if(typeof req.body.coinValue !== "number" || req.body.coinValue <= 0
				|| !Number.isInteger(req.body.coinValue)) {
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

	api.post("/update/:reward", async(req, res) => {
		await auth.requireAreaAdmin(req, await db.reward.getArea(req.reward));
		if(!await validate(req.body, false)) {
			return res.sendStatus(400);
		}
		await db.reward.updateInfo(req.reward, req.body);
		res.send({});
	});

	api.get("/remove/:reward", async(req, res) => {
		await auth.requireAreaAdmin(req, await db.reward.getArea(req.reward));
		await db.reward.remove(req.reward);
		res.send({});
	});

	api.get("/buy/:reward", async(req, res) => {
		await auth.requireUser(req);
		const user = await db.user.getInfo(req.userId);
		const reward = await db.reward.getInfo(req.reward);
		if(user.coinBalance < reward.coinValue || !reward.verified
				|| await db.area.getPrimaryAdmin(reward.area) === null) {
			return res.sendStatus(400);
		}
		await db.user.setUnclaimedBalance(req.userId, user.coinBalance - reward.coinValue);
		reward.id = req.reward;
		await coins.rewardPurchaseDone(user, reward);
		res.send({});
	});

	return api;
};
