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
			const path = req.path;
			const body = Object.assign({}, req.body);
			for(let key of ["password", "old", "new", "image"]) {
				if(typeof body[key] === "string") {
					body[key] = "...";
				}
			}
			const oldSend = res.send;
			res.send = function(arg) {
				let output = arg;
				if(typeof arg !== "string" && !(arg instanceof Buffer)) {
					output = {};
					for(let key in arg) {
						if(arg[key] instanceof Array && arg[key].length > 1) {
							output[key] = [arg[key][0], "..."];
						} else {
							output[key] = arg[key];
						}
					}
				}
				console.log();
				console.log(req.method, path, body);
				console.log(this.statusCode, output);
				this.send = oldSend;
				this.send(arg);
			};
			next();
		});
	}

	for(let object of objects.all) {
		app.use(`/${object}`, require(`./apis/${object}.js`)(config, db, coins));
	}

	app.get("/contract", async(req, res) => {
		res.send(await coins.getContractJson());
	});

	app.use((req, res) => {
		res.sendStatus(404);
	});

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
