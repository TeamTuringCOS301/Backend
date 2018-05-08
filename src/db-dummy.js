const session = require("express-session");

const admins = [];
const users = [];

const db = {
	sessionStore: new session.MemoryStore(),

	verifyAdmin(json) {
		return typeof json.username === "string" && typeof json.password === "string";
	},

	async addAdmin(json) {
		if(await db.findAdmin(json.username) !== null) {
			return null;
		}
		return admins.push(json) - 1;
	},

	async findAdmin(username) {
		for(let i in admins) {
			if(admins[i].username === username) {
				return i;
			}
		}
		return null;
	},

	async getAdminPassword(id) {
		return admins[id].password;
	},

	verifyUser(json) {
		return typeof json.username === "string" && typeof json.password === "string";
	},

	async addUser(json) {
		if(await db.findUser(json.username) !== null) {
			return null;
		}
		return users.push(json) - 1;
	},

	async findUser(username) {
		for(let i in users) {
			if(users[i].username === username) {
				return i;
			}
		}
		return null;
	},

	async getUserPassword(id) {
		return users[id].password;
	}
};

module.exports = db;
