const express = require("express");
const imageType = require("image-type");
const inPolygon = require("../in-polygon.js");
const objects = require("../objects.js");
const validator = require("../validate.js");

module.exports = (config, db, coins, sendMail, notifyAdmins) => {
	const auth = require("../auth.js")(db);

	async function validate(info, initial = true) {
		return validator.validateText(info.title)
			&& validator.validateDescription(info.title)
			&& [0, 1, 2].includes(info.severity)
			&& validator.validatePoint(info.location)
			&& inPolygon(info.location, await db.area.getBorder(info.area))
			&& (!info.image || validator.validateImage(info.image))
			&& (initial || typeof info.broadcast === "boolean");
	}

	const api = express();
	objects.addParams(api, db);

	api.post("/add/:area", async(req, res) => {
		req.body.time = new Date().getTime();
		req.body.area = req.area;
		if(await auth.isUser(req)) {
			req.body.user = req.userId;
			req.body.broadcast = false;
		} else {
			req.body.user = null;
			req.body.broadcast = true;
			await auth.requireAreaAdmin(req, req.area);
		}
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		await db.alert.add(req.body);
		notifyAdmins(req.body, await db.admin.getAreaTokens(req.area), req.hostname);
		res.send({});
	});

	api.get("/broadcasts/:area/:since", async(req, res) => {
		const alerts = await db.alert.listBroadcasts(req.area, req.since);
		let latest = 0;
		for(let alert of alerts) {
			latest = Math.max(latest, alert.time);
		}
		res.send({alerts, latest});
	});

	api.get("/image/:alert", async(req, res) => {
		const image = await db.alert.getImage(req.alert);
		if(image === null) {
			return res.sendStatus(404);
		}
		res.set('Content-Type', imageType(image).mime);
		res.send(image);
	});

	api.get("/list/:area/:since", async(req, res) => {
		await auth.requireAreaAdmin(req, req.area);
		const alerts = await db.alert.list(req.area, req.since);
		let latest = 0;
		for(let alert of alerts) {
			latest = Math.max(latest, alert.time);
		}
		res.send({alerts, latest});
	});

	api.post("/update/:alert", async(req, res) => {
		await auth.requireAreaAdmin(req, await db.alert.getArea(req.alert));
		req.body.area = await db.alert.getArea(req.alert);
		if(!await validate(req.body, false)) {
			return res.sendStatus(400);
		}
		await db.alert.updateInfo(req.alert, req.body);
		res.send({});
	});

	api.get("/remove/:alert", async(req, res) => {
		await auth.requireAreaAdmin(req, await db.alert.getArea(req.alert));
		await db.alert.remove(req.alert);
		res.send({});
	});

	return api;
};
