const express = require("express");

module.exports = db => {
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

	api.use(async(req, res, next) => {
		if(typeof req.session.userId === "string") {
			req.userId=parseInt(req.session.userId);
			next();
	 	} else {
			res.sendStatus(401);
		}
	});

	api.get("/list/:id", async(req, res) => {
		const points = await db.point.list(req.id);
		let latest=0;
		for(let point of points) {
			latest=Math.max(latest,point.time);
			point.time=undefined;
		}
		res.send({points,latest});
	});

	api.get("/list/:id/:since", async(req, res) => {
		const points = await db.point.listSince(req.id,req.since);
		let latest=0;
		for(let point of points) {
			latest=Math.max(latest,point.time);
			point.time=undefined;
		}
		res.send({points,latest});
	});

	api.post("/add/:id", async(req, res) => {
		const currentTime= new Date().getTime();
		const userLatestTime=await db.user.getLatestTime(req.userId);
		if(currentTime-userLatestTime<60000){
			 res.sendStatus(400);
			 return;
		}

		const numPoints= await db.point.getNumPoints(req.body);
		const prob= 0.07*Math.exp(-numPoints*0.001);

		let coin=false;
		if(Math.random()<prob){
			//TODO: Award coin
			result=true;
		}

		await db.point.add(req.body,req.userId,req.id,currentTime);

		res.send({coin});
	});

	return api;
};
