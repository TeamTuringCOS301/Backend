const cors = require("cors");
const express = require("express");
const session = require("express-session");
require("express-async-errors");

module.exports = (config, db) => {
	const app = express();
	app.use(cors({origin: true, credentials: true}));
	app.use(express.json());
	app.use(session({
		cookie: {
			maxAge: config.sessionCookie.maxAge,
			secure: true
		},
		resave: false,
		saveUninitialized: false,
		secret: config.sessionCookie.secret,
		store: db.sessionStore
	}));

	// TODO: remove
	if(!db.disableLogging) {
		app.use((req, res, next) => {
			console.log(`${req.method} ${req.path}`);
			console.log(req.headers);
			console.log(req.body);
			next();
		});
	}

	app.param("since", async(req, res, next, since) => {
		req.since = parseInt(since);
		if(isNaN(req.since)) {
			return res.sendStatus(400);
		}
		next();
	});

	const objects = ["admin", "alert", "area", "point", "reward", "superadmin", "user"];
	for(let object of objects) {
		app.param(object, async(req, res, next, id) => {
			req[object] = parseInt(id);
			if(isNaN(req[object]) || !await db[object].validId(req[object])) {
				return res.sendStatus(400);
			}
			next();
		});
	}
	for(let object of objects) {
		app.use(`/${object}`, require(`./apis/${object}.js`)(config, db));
	}

	app.use((err, req, res, next) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
};
