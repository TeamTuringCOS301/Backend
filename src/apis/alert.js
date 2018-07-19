const express = require("express");
const imageType = require("image-type");
const inPolygon = require("../in-polygon.js");
const isBase64 = require("is-base64");
const objects = require("../objects.js");

module.exports = (config, db, coins) => {
	const auth = require("../auth.js")(db);

	async function validate(info) { // TODO: proper validation
		for(let key of ["title", "description"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		for(let key of ["lat", "lng"]) {
			if(!("location" in info) || typeof info.location[key] !== "number") {
				return false;
			}
		}
		return [0, 1, 2].includes(info.severity) && (!info.image || isBase64(info.image)
				&& imageType(Buffer.from(info.image, "base64")) !== null)
			&& inPolygon(info.location, await db.area.getBorder(info.area));
	}

	const api = express();
	objects.addParams(api, db);

	api.post("/add/:area", async(req, res) => {
		req.body.time = new Date().getTime();
		req.body.area = req.area;
		if(await auth.isUser(req)) {
			req.body.user = req.userId;
		} else {
			await auth.requireAreaAdmin(req, req.area);
		}
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		await db.alert.add(req.body);
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

	api.post("/broadcast/:alert", async(req, res) => {
		await auth.requireAreaAdmin(req, await db.alert.getArea(req.alert));
		if(typeof req.body.broadcast !== "boolean") {
			return res.sendStatus(400);
		}
		await db.alert.setBroadcast(req.alert, req.body.broadcast);
		res.send({});
	});

	api.get("/remove/:alert", async(req, res) => {
		await auth.requireAreaAdmin(req, await db.alert.getArea(req.alert));
		await db.alert.remove(req.alert);
		res.send({});
	});

	return api;
};
