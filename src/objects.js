exports.all = ["admin", "alert", "area", "point", "reward", "superadmin", "user"];

exports.addParams = (api, db) => {
	for(let object of exports.all) {
		api.param(object, async(req, res, next, id) => {
			req[object] = parseInt(id);
			if(isNaN(req[object])) {
				return res.sendStatus(400);
			}
			if(!await db[object].validId(req[object])) {
				return res.sendStatus(404);
			}
			next();
		});
	}

	api.param("since", async(req, res, next, since) => {
		req.since = parseInt(since);
		if(isNaN(req.since)) {
			return res.sendStatus(400);
		}
		next();
	});
};
