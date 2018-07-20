const express = require("express");
const inPolygon = require("../in-polygon.js");
const objects = require("../objects.js");

module.exports = (config, db, coins) => {
	const auth = require("../auth.js")(db);

	async function validate(info) { // TODO: proper validation
		for(let key of ["lat", "lng"]) {
			if(typeof info[key] !== "number") {
				return false;
			}
		}
		return info.time - await db.user.getLatestTime(info.user)
			>= config.coinRewards.newPointInterval;
	}

	const api = express();
	objects.addParams(api, db);

	api.get("/list/:area/:since", async(req, res) => {
		const points = await db.point.list(req.area, req.since);
		let latest = 0;
		for(let point of points) {
			latest = Math.max(latest, point.time);
			point.time = undefined;
		}
		res.send({points, latest});
	});

	api.post("/add/:area", async(req, res) => {
		await auth.requireUser(req);
		req.body.time = new Date().getTime();
		req.body.area = req.area;
		req.body.user = req.userId;
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		} else if(!inPolygon(req.body, await db.area.getBorder(req.area))) {
			return res.sendStatus(418);
		}
		const numPoints = await db.point.countNearbyPoints(req.body);
		const prob = config.coinRewards.maxProbability
			* Math.exp(-numPoints * config.coinRewards.expScale);
		let coin = false;
		if(Math.random() < prob){
			await coins.rewardCoin(await db.user.getWalletAddress(req.userId));
			coin = true;
		}
		await db.point.add(req.body);
		res.send({coin});
	});

	return api;
};
