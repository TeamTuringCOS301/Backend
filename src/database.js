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
		for(let key of ["username", "email", "password", "name", "surname", "cellNumber"]) {
			if(typeof json[key] !== "string") {
				return false;
			}
		}
		return true;
	},

	async addAdmin(json) {
		if(await db.findAdmin(json.username) !== null) {
			return null;
		}
		await query(
			"INSERT INTO tblAdminUser (admUsername, admEmailAddress, admPassword, admName, admSurname, admCellNumber) VALUES (?, ?, ?, ?, ?, ?)",
			[json.username, json.email, json.password, json.name, json.surname, json.cellNumber]
		);
	},

	async findAdmin(username) {
		const results = await query(
			"SELECT admID from tblAdminUser WHERE admUsername = ?",
			[username]
		);
		if(results.length) {
			return results[0].admID;
		} else {
			return null;
		}
	},

	async getAdminPassword(id) {
		const results = await query(
			"SELECT admPassword from tblAdminUser WHERE admID = ?",
			[id]
		);
		if(results.length) {
			return results[0].admPassword;
		} else {
			return null;
		}
	},

	verifyUser(json) {
		for(let key of ["username", "email", "password", "name", "surname", "cellNumber"]) {
			if(typeof json[key] !== "string") {
				return false;
			}
		}
		return true;
	},

	async addUser(json) {
		if(await db.findUser(json.username) !== null) {
			return null;
		}
		await query(
			"INSERT INTO tblUser (usrUsername, usrEmailAddress, usrPassword, usrName, usrSurname, usrCellNumber) VALUES (?, ?, ?, ?, ?, ?)",
			[json.username, json.email, json.password, json.name, json.surname, json.cellNumber]
		);
	},

	async findUser(username) {
		const results = await query(
			"SELECT usrID from tblUser WHERE usrUsername = ?",
			[username]
		);
		if(results.length) {
			return results[0].usrID;
		} else {
			return null;
		}
	},

	async getUserPassword(id) {
		const results = await query(
			"SELECT usrPassword from tblUser WHERE usrID = ?",
			[id]
		);
		if(results.length) {
			return results[0].usrPassword;
		} else {
			return null;
		}
	}
};

module.exports = db;
