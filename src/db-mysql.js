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

const db = {
	sessionStore: new Store(config.mysql),

	verifyAdmin(json) {
		return typeof json.username === "string" && typeof json.password === "string";
	},

	async addAdmin(json) {
		return null;
	},

	async findAdmin(username) {
		return null;
	},

	async getAdminPassword(id) {
		return null;
	},

	verifyUser(json) {
		return typeof json.username === "string" && typeof json.password === "string";
	},

	async addUser(json) {
		return null;
	},

	async findUser(username) {
		return null;
	},

	async getUserPassword(id) {
		return null;
	}
};

module.exports = db;
