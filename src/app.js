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
			maxAge: 86400, // TODO: update
			secure: true
		},
		resave: false,
		saveUninitialized: false,
		secret: config.cookieSecret,
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

	for(let api of ["admin", "alert", "area", "point", "reward", "user"]) {
		app.use(`/${api}`, require(`./apis/${api}.js`)(db));
	}

	app.use((err, req, res, next) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
};
