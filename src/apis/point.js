const express = require("express");

module.exports = (db) => {
	const api = express();

	api.param("id", async(req, res, next, id) => {
		req.id = parseInt(id);
		if(isNaN(req.id) || await db.area.find(id) === null) {
			res.sendStatus(400);
		} else {
			next();
		}
	});

	api.param("since", async(req, res, next, since) => {
		req.since = parseInt(since);
		if(isNaN(req.since)) {
			res.sendStatus(400);
		} else {
			next();
		}
	});

	api.get("/list/:id", async(req, res) => {
		const points = await db.point.list(req.id);
		let latest = 0;
		for(let point of points) {
			latest = Math.max(latest, point.time);
			point.time = undefined;
		}
		res.send({points, latest});
	});

	api.get("/list/:id/:since", async(req, res) => {
		const points = await db.point.listSince(req.id, req.since);
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
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.post("/add/:id", async(req, res) => {
		// TODO: Confirm that point is in conservation area.
		if(typeof req.body.lat !== "number" || typeof req.body.lng !== "number") {
			return res.sendStatus(400);
		}
		const currentTime = new Date().getTime();
		const latestTime = await db.user.getLatestTime(req.userId);
		if(currentTime - latestTime < 10000) { // TODO: Update limit.
			 return res.sendStatus(400);
		}

		const numPoints = await db.point.countNearbyPoints(req.body, req.id);
		const prob = 0.07 * Math.exp(-numPoints * 0.001); // TODO: Update parameters.
		let coin = false;
		if(Math.random() < prob){
			// TODO: Award coin.
			coin = true;
		}
		await db.point.add(req.body, req.id, req.userId, currentTime);
		res.send({coin});
	});

	return api;
};
