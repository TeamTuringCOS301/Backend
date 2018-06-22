const config = require("./config.js");
const mysql = require("mysql");
const session = require("express-session");
const Store = require("express-mysql-session")(session);

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

const db = {sessionStore: new Store(config.mysql)};
for(let object of ["admin", "alert", "area", "point", "reward", "user"]) {
	db[object] = require(`./db/${object}.js`)(config, query);
}

module.exports = db;
