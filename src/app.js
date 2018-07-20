const cors = require("cors");
const express = require("express");
const session = require("express-session");
const nocache = require("nocache");
const objects = require("./objects.js");
require("express-async-errors");

module.exports = (config, db, coins) => {
	const auth = require("./auth.js")(db);

	const app = express();
	app.use(cors({origin: true, credentials: true}));
	app.use(express.json({limit: config.maxImageSize}));
	app.use(nocache());
	app.use(session({
		cookie: {
			// TODO: re-enable
			//maxAge: config.sessionCookie.maxAge,
			secure: db.secureCookies
		},
		resave: false,
		saveUninitialized: false,
		secret: config.sessionCookie.secret,
		store: db.sessionStore
	}));

	if(config.logRequests) {
		app.use((req, res, next) => {
			console.log(`${req.method} ${req.path}`);
			console.log(req.headers);
			const body = Object.assign({}, req.body);
			for(let key of ["password", "old", "new", "image"]) {
				if(typeof body[key] === "string") {
					body[key] = "...";
				}
			}
			console.log(body);
			next();
		});
	}

	for(let object of objects.all) {
		app.use(`/${object}`, require(`./apis/${object}.js`)(config, db, coins));
	}

	app.use((err, req, res, next) => {
		if(err instanceof auth.AuthError) {
			res.sendStatus(401);
		} else {
			console.error(err);
			res.sendStatus(500);
		}
	});
	return app;
};
