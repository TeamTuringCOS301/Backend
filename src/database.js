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
		async verify(info) { // TODO: proper validation
			for(let key of ["username", "email", "name", "surname"]) {
				if(typeof info[key] !== "string") {
					return false;
				}
			}
			return true;
		},

		async add(info) {
			await query(
				"INSERT INTO tblAdminUser (admUsername, admEmailAddress, admPassword, admName, admSurname, admSuperAdmin) VALUES (?, ?, ?, ?, ?, 0)",
				[info.username, info.email, info.password, info.name, info.surname]
			);
		},

		async remove(id) {
			await query(
				"DELETE FROM tblAdminUser WHERE admID = ?",
				[id]
			);
		},

		async list() {
			const results = await query(
				"SELECT admUsername, admEmailAddress, admName, admSurname FROM tblAdminUser WHERE admSuperAdmin = 0"
			);
			const admins = [];
			for(let admin of results) {
				admins.push({
					username: admin.admUsername,
					email: admin.admEmailAddress,
					name: admin.admName,
					surname: admin.admSurname,
				});
			}
			return admins;
		},

		async find(username) {
			const results = await query(
				"SELECT admID FROM tblAdminUser WHERE admUsername = ?",
				[username]
			);
			if(results.length) {
				return results[0].admID;
			} else {
				return null;
			}
		},

		async isSuperAdmin(id) {
			const results = await query(
				"SELECT admSuperAdmin FROM tblAdminUser WHERE admID = ?",
				[id]
			);
			return results[0].admSuperAdmin === 1;
		},

		async getPassword(id) {
			const results = await query(
				"SELECT admPassword FROM tblAdminUser WHERE admID = ?",
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
				"SELECT admUsername, admEmailAddress, admName, admSurname FROM tblAdminUser WHERE admID = ?",
				[id]
			);
			return {
				username: results[0].admUsername,
				email: results[0].admEmailAddress,
				name: results[0].admName,
				surname: results[0].admSurname,
			};
		},

		async updateInfo(id, info) {
			const fields = {
				email: "admEmailAddress",
				name: "admName",
				surname: "admSurname",
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
		async verify(info) { // TODO: proper validation
			for(let key of ["username", "email", "password", "name", "surname", "walletAddress"]) {
				if(typeof info[key] !== "string") {
					return false;
				}
			}
			return true;
		},

		async add(info) {
			await query(
				"INSERT INTO tblUser (usrUsername, usrEmailAddress, usrPassword, usrName, usrSurname, usrWalletAddress, usrLastPointTime) VALUES (?, ?, ?, ?, ?, ?, 0)",
				[info.username, info.email, info.password, info.name, info.surname, info.walletAddress]
			);
		},

		async find(username) {
			const results = await query(
				"SELECT usrID FROM tblUser WHERE usrUsername = ?",
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
				"SELECT usrPassword FROM tblUser WHERE usrID = ?",
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
				"SELECT usrUsername, usrEmailAddress, usrName, usrSurname, usrWalletAddress FROM tblUser WHERE usrID = ?",
				[id]
			);
			return {
				username: results[0].usrUsername,
				email: results[0].usrEmailAddress,
				name: results[0].usrName,
				surname: results[0].usrSurname,
				walletAddress: results[0].usrWalletAddress
			};
		},

		async updateInfo(id, info) {
			const fields = {
				email: "usrEmailAddress",
				name: "usrName",
				surname: "usrSurname",
				walletAddress: "usrWalletAddress",
			};
			for(let key in fields) {
				if(typeof info[key] === "string") {
					await query(
						`UPDATE tblUser SET ${fields[key]} = ? WHERE usrID = ?`,
						[info[key], id]
					);
				}
			}
		},

		async getLatestTime(id){
			const result= await query(
				'SELECT usrLastPointTime FROM tblUser WHERE usrID=?',
				[id]
			);
			return result[0].usrLastPointTime;
		}
	},

	area: {
		async verify(info) { // TODO: proper validation
			for(let key of ["name", "city", "province"]) {
				if(typeof info[key] !== "string") {
					return false;
				}
			}
			return true;
		},

		async add(info) {
			await query(
				"INSERT INTO tblConservationArea (conName, conCity, conProvince, conBorderNodeJSONObject, conMiddlePointCoordinate, tblAdminUser_admID) VALUES (?, ?, ?, ?, ?, ?)",
				[info.name, info.city, info.province, info.border, info.middle, info.admin]
			);
		},

		async remove(id) {
			await query(
				"DELETE FROM tblConservationArea WHERE conID = ?",
				[id]
			);
		},

		async find(id) {
			const results = await query(
				"SELECT conID FROM tblConservationArea WHERE conID = ?",
				[id]
			);
			if(results.length) {
				return results[0].conID;
			} else {
				return null;
			}
		},

		async getAdmin(id) {
			const results = await query(
				"SELECT tblAdminUser_admID FROM tblConservationArea WHERE conID = ?",
				[id]
			);
			return results[0].admID;
		},

		async list() {
			const results = await query(
				"SELECT conID, conName, conCity, conProvince, conMiddlePointCoordinate FROM tblConservationArea"
			);
			const conservationAreas = [];
			for(let conservationArea of results) {
				conservationAreas.push({
					id: conservationArea.conID,
					name: conservationArea.conName,
					city: conservationArea.conCity,
					province: conservationArea.conProvince,
					middle: conservationArea.conMiddlePointCoordinate
				});
			}
			return conservationAreas;
		},

		async getInfo(id) {
			const results = await query(
				"SELECT conName, conCity, conProvince, conMiddlePointCoordinate, conBorderNodeJSONObject FROM tblConservationArea WHERE conID = ?",
				[id]
			);
			return {
				name: results[0].conName,
				city: results[0].conCity,
				province: results[0].conProvince,
				middle: results[0].conMiddlePointCoordinate,
				border: results[0].conBorderNodeJSONObject
			};
		},

		async updateInfo(id, info) {
			const fields = {
				name: "conName",
				city: "conCity",
				province: "conProvince",
				middle: "conMiddlePointCoordinate",
				border: "conBorderNodeJSONObject"
			};
			for(let key in fields) {
				if(typeof info[key] === "string") {
					await query(
						`UPDATE tblConservationArea SET ${fields[key]} = ? WHERE conID = ?`,
						[info[key], id]
					);
				}
			}
			if(typeof info.admin === number) {
				await query(
					"UPDATE tblConservationArea SET tblAdminUser_admID = ? WHERE conID = ?",
					[info.admin, id]
				);
			}
		}
	},

	point:{
		async getNumPoints(id,point) {
			/*const results = await query(
				`SELECT
					2 * 3961 * asin(sqrt((sin(radians((? - cupLocationLatitude) / 2))) ^ 2
					+ cos(radians(cupLocationLatitude)) * cos(radians(?)) * (sin(radians((? - cupLocationLongitude) / 2))) ^ 2)) as distance
					FROM tblConservationAreaUserPoints
					WHERE conID=? AND distance<100`,
				[point.lat,point.lat,point.lng,id]
			);*/
			//return results.length;
			return 0;
		},

		async add(point,userId,conId,time){
			await query(
				'UPDATE tblUser SET usrLastPointTime=? WHERE usrID=?'
			,[time,userId]);

			await query(
				'INSERT INTO tblConservationAreaUserPoints (cupDateTime,cupLocationLatitude,cupLocationLongitude,tblConservationArea_conID) VALUES(?,?,?,?)',
				[time,point.lat,point.lng,conId]
			);
		}
	}
};

module.exports = db;
