const express = require("express");
const objects = require("../objects.js");

module.exports = (config, db, coins) => {
	const auth = require("../auth.js")(db);

	function validateBorder(info) {
		info.middle = undefined;
		if(!(info.border instanceof Array)) {
			info.border = undefined;
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
		info.middle = {
			lat: lat / info.border.length,
			lng: lng / info.border.length
		};
		return true;
	}

	async function validate(info, initial = true) { // TODO: proper validation
		for(let key of ["name", "city", "province"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return validateBorder(info);
	}

	const api = express();
	objects.addParams(api, db);

	api.get("/list", async(req, res) => {
		const areas = await db.area.list();
		res.send({areas});
	});

	api.get("/info/:area", async(req, res) => {
		res.send(await db.area.getInfo(req.area));
	});

	api.post("/update/:area", async(req, res) => {
		await auth.requireSuperAdmin(req);
		if(!await validate(req.body, false)) {
			return res.sendStatus(400);
		}
		await db.admin.updateInfo(req.area, req.body);
		res.send({});
	});

	api.post("/add", async(req, res) => {
		await auth.requireSuperAdmin(req);
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		await db.area.add(req.body);
		res.send({});
	});

	api.get("/remove/:area", async(req, res) => {
		await auth.requireSuperAdmin(req);
		await db.area.remove(req.area);
		res.send({});
	});

	return api;
};
