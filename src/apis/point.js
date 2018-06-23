const express = require("express");
const inPolygon = require("../in-polygon.js");

module.exports = (config, db) => {
	async function validate(info) { // TODO: proper validation
		for(let key of ["lat", "lng"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return info.time - await db.user.getLatestTime(info.user)
				< config.coinRewards.newPointInterval
			&& inPolygon(info, await db.area.getBorder(info.area));
	}

	const api = express();

	api.get("/list/:area/:since", async(req, res) => {
		const points = await db.point.list(req.id, req.since);
		let latest = 0;
		for(let point of points) {
			latest = Math.max(latest, point.time);
			point.time = undefined;
		}
		res.send({points, latest});
	});

	api.use(async(req, res, next) => {
		if("userId" in req.session) {
			req.userId = parseInt(req.session.userId);
			if(await db.user.validId(req.userId)) {
				return next();
			}
		}
		res.sendStatus(401);
	});

	api.post("/add/:area", async(req, res) => {
		req.body.time = new Date().getTime();
		req.body.area = req.area;
		req.body.user = req.userId;
		if(!await validate(info)) {
			return res.sendStatus(400);
		}
		const numPoints = await db.point.countNearbyPoints(req.body);
		const prob = config.coinRewards.maxProbability
			* Math.exp(-numPoints * config.coinRewards.expScale);
		let coin = false;
		if(Math.random() < prob){
			// TODO: Award coin.
			coin = true;
		}
		await db.point.add(req.body);
		res.send({coin});
	});

	return api;
};
