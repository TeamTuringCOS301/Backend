const express = require("express");

function verifyBorder(info) {
	if(!(info.border instanceof Array)) {
		return false;
	}
	let lat = 0, lng = 0;
	for(let point of info.border) {
		if(typeof point.lat !== "number" || typeof point.lng !== "number") {
			return false;
		}
		lat += point.lat;
		lng += point.lng;
	}
	info.middle = JSON.stringify({
		lat: lat / info.border.length,
		lng: lng / info.border.length
	});
	info.border = JSON.stringify(info.border);
	return true;
}

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

	api.get("/list", async(req, res) => {
		const areas = await db.area.list();
		for(let area of areas) {
			area.middle = JSON.parse(area.middle);
		}
		res.send({areas});
	});

	api.get("/info/:id", async(req, res) => {
		const info = await db.area.getInfo(req.id);
		info.border = JSON.parse(info.border);
		info.middle = JSON.parse(info.middle);

		res.send(await db.area.getInfo(req.id));
	});

	api.use(async(req, res, next) => {
		if("adminId" in req.session && await db.admin.isSuperAdmin(parseInt(req.session.adminId))) {
			next();
		} else {
			res.sendStatus(401);
		}
	});

	api.post("/info/:id", async(req, res) => {
		if(typeof req.body.admin === "number") {
			return res.sendStatus(400);
		}
		if(typeof req.body.admin === "string") {
			req.body.admin = db.admin.find(req.body.admin);
			if(req.body.admin === null) {
				return res.sendStatus(400);
			}
		}
		if(req.body.border instanceof Array && !verifyBorder(req.body)) {
			return res.sendStatus(400);
		}
		await db.admin.updateInfo(req.id, req.body);
		res.end();
	});

	api.post("/add", async(req, res) => {
		if(typeof req.body.admin === "string") {
			req.body.admin = await db.admin.find(req.body.admin);
			if(req.body.admin !== null && verifyBorder(req.body)
					&& await db.area.verify(req.body)) {
				await db.area.add(req.body);
				return res.end();
			}
		}
		res.sendStatus(400);
	});

	api.get("/remove/:id", async(req, res) => {
		await db.area.remove(req.id);
		res.end();
	});

	return api;
};
