const config = require("./config.js");
const mysql = require("mysql");
const session = require("express-session");
const Store = require("express-mysql-session")(session);
const objects = require("./objects.js");

const pool = mysql.createPool(config.mysql);
function query(...args) {
	return new Promise((resolve, reject) => {
		pool.query(...args, (err, results) => {
			if(err) {
				reject(err);
			} else {
				resolve(results);
			}
		});
	});
}

const db = {sessionStore: new Store(config.mysql), secureCookies: true};
for(let object of objects.all) {
	db[object] = require(`./db/${object}.js`)(config, query);
}

module.exports = db;
