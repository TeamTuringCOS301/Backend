const cors = require("cors");
const express = require("express");
const session = require("express-session");
const objects = require("./objects.js");
require("express-async-errors");

module.exports = (config, db) => {
	const app = express();
	app.use(cors({origin: true, credentials: true}));
	app.use(express.json({limit: config.maxImageSize}));
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

	for(let object of objects.all) {
		app.use(`/${object}`, require(`./apis/${object}.js`)(config, db));
	}

	app.use((err, req, res, next) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
};
