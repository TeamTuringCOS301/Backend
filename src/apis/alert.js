const express = require("express");
const inPolygon = require("../in-polygon.js");
const isBase64 = require("is-base64");
const objects = require("../objects.js");

module.exports = (config, db) => {
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
		return [0, 1, 2].includes(info.severity) && (!info.image || isBase64(info.image))
			&& inPolygon(info.location, await db.area.getBorder(info.area));
	}

	const api = express();
	objects.addParams(api, db);

	api.post("/add/:area", async(req, res) => {
		req.body.time = new Date().getTime();
		req.body.area = req.area;
		let auth = false;
		if("userId" in req.session) {
			req.body.user = parseInt(req.session.userId);
			if(await db.user.validId(req.body.user)) {
				auth = true;
			}
		} else if("adminId" in req.session
				&& await db.admin.validId(parseInt(req.session.adminId))) {
			auth = true;
		}
		if(!auth) {
			return res.sendStatus(401);
		}
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		await db.alert.add(req.body);
		res.send({});
	});

	api.get("/broadcasts/:area/:since", async(req, res) => {
		const alerts = await db.alert.listBroadcasts(req.area, req.since);
		res.send({alerts});
	});

	api.use(async(req, res, next) => {
		if("adminId" in req.session) {
			req.adminId = parseInt(req.session.adminId);
			if(await db.area.validId(req.adminId)) {
				return next();
			}
		}
		res.sendStatus(401);
	});

	api.get("/list/:area/:since", async(req, res) => {
		if(await db.admin.getArea(req.adminId) !== req.area) {
			return res.sendStatus(401);
		}
		const alerts = await db.alert.list(req.area, req.since);
		res.send({alerts});
	});

	api.post("/broadcast/:alert", async(req, res) => {
		if(await db.admin.getArea(req.adminId) !== await db.alert.getArea(req.alert)) {
			return res.sendStatus(401);
		}
		if(typeof req.body.broadcast !== "boolean") {
			return res.sendStatus(400);
		}
		await db.alert.setBroadcast(req.alert, req.body.broadcast);
		res.send({});
	});

	api.get("/remove/:alert", async(req, res) => {
		if(await db.admin.getArea(req.adminId) !== await db.alert.getArea(req.alert)) {
			return res.sendStatus(401);
		}
		await db.alert.remove(req.alert);
		res.send({});
	});

	return api;
};
