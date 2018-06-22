const express = require("express");
const inPolygon = require("./in-polygon.js");

module.exports = (db) => {
	const api = express();

	api.param("area", async(req, res, next, id) => {
		req.area = parseInt(id);
		if(isNaN(req.area) || await db.area.find(req.area) === null) {
			res.sendStatus(400);
		} else {
			next();
		}
	});

	api.param("id", async(req, res, next, id) => {
		req.id = parseInt(id);
		if(isNaN(req.id) || await db.alert.getArea(req.id) === req.area) {
			res.sendStatus(400);
		} else {
			next();
		}
	});

	api.post("/add/:area", async(req, res) => {
		if(!("userId" in req.session || "adminId" in req.session
				&& await db.area.getAdmin(req.area) === parseInt(req.session.adminId))) {
			return res.sendStatus(401);
		}
		if(!await db.alert.verify(req.body)
				|| !inPolygon(req.body.location, await db.area.getBorder(req.area))) {
			return res.sendStatus(400);
		}
		await db.alert.add(req.body, req.area, parseInt(req.session.userId));
		res.end();
	});

	api.get("/list/broadcast/:area", async(req, res) => {
		const alerts = await db.alert.list();
		res.send({alerts});
	});

	api.use(async(req, res, next) => {
		if("adminId" in req.session) {
			req.adminId = parseInt(req.session.adminId);
			if(await db.area.getAdmin(req.area) === req.adminId) {
				next();
			}
		}
		res.sendStatus(401);
	});

	api.get("/list/all/:area", async(req, res) => {
		const alerts = await db.alert.list();
		res.send({alerts});
	});

	api.post("/broadcast/:area/:id", async(req, res) => {
		if(typeof req.body.broadcast !== "boolean") {
			return res.sendStatus(400);
		}
		await db.alert.broadcast(req.id, req.body.broadcast);
		res.end();
	});

	api.get("/remove/:area/:id", async(req, res) => {
		await db.alert.remove(req.id);
		res.end();
	});

	return api;
};
