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

	admin: {
		verify(info) { // TODO: proper validation
			for(let key of ["username", "email", "password", "name", "surname", "cellNumber"]) {
				if(typeof info[key] !== "string") {
					return false;
				}
			}
			return true;
		},

		async add(info) {
			await query(
				"INSERT INTO tblAdminUser (admUsername, admEmailAddress, admPassword, admName, admSurname, admCellNumber, admSuperAdmin) VALUES (?, ?, ?, ?, ?, ?, 0)",
				[info.username, info.email, info.password, info.name, info.surname, info.cellNumber]
			);
		},

		async find(username) {
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

		async getPassword(id) {
			const results = await query(
				"SELECT admPassword from tblAdminUser WHERE admID = ?",
				[id]
			);
			return results[0].admPassword;
		},

		async setPassword(id, password) {
			await query(
				"UPDATE tblAdminUser SET admPassword = ? WHERE admID = ?",
				[password, id]
			);
		},

		async getInfo(id) {
			const results = await query(
				"SELECT admUsername, admEmailAddress, admName, admSurname, admCellNumber FROM tblAdminUser WHERE admID = ?",
				[id]
			);
			return {
				username: results[0].admUsername,
				email: results[0].admEmailAddress,
				name: results[0].admName,
				surname: results[0].admSurname,
				cellNumber: results[0].admCellNumber
			};
		},

		async updateInfo(id, info) {
			const fields = {
				email: "admEmailAddress",
				name: "admName",
				surname: "admSurname",
				cellNumber: "admCellNumber"
			};
			for(let key in fields) {
				if(typeof info[key] === "string") {
					await query(
						`UPDATE tblAdminUser SET ${fields[key]} = ? WHERE admID = ?`,
						[info[key], id]
					);
				}
			}
		}
	},

	user: {
		verify(info) { // TODO: proper validation
			for(let key of ["username", "email", "password", "name", "surname", "cellNumber"]) {
				if(typeof info[key] !== "string") {
					return false;
				}
			}
			return true;
		},

		async add(info) {
			await query(
				"INSERT INTO tblUser (usrUsername, usrEmailAddress, usrPassword, usrName, usrSurname, usrCellNumber) VALUES (?, ?, ?, ?, ?, ?)",
				[info.username, info.email, info.password, info.name, info.surname, info.cellNumber]
			);
		},

		async find(username) {
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

		async getPassword(id) {
			const results = await query(
				"SELECT usrPassword from tblUser WHERE usrID = ?",
				[id]
			);
			return results[0].usrPassword;
		},

		async setPassword(id, password) {
			await query(
				"UPDATE tblUser SET usrPassword = ? WHERE usrID = ?",
				[password, id]
			);
		},

		async getInfo(id) {
			const results = await query(
				"SELECT usrUsername, usrEmailAddress, usrName, usrSurname, usrCellNumber FROM tblUser WHERE usrID = ?",
				[id]
			);
			return {
				username: results[0].usrUsername,
				email: results[0].usrEmailAddress,
				name: results[0].usrName,
				surname: results[0].usrSurname,
				cellNumber: results[0].usrCellNumber
			};
		},

		async updateInfo(id, info) {
			const fields = {
				email: "usrEmailAddress",
				name: "usrName",
				surname: "usrSurname",
				cellNumber: "usrCellNumber"
			};
			for(let key in fields) {
				if(typeof info[key] === "string") {
					await query(
						`UPDATE tblUser SET ${fields[key]} = ? WHERE usrID = ?`,
						[info[key], id]
					);
				}
			}
		}
	}
};

module.exports = db;
