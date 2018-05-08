const session = require("express-session");

const users = [];

const db = {
	sessionStore: new session.MemoryStore(),

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
