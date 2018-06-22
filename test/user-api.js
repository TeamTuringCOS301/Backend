const fs = require("fs");
const session = require("express-session");

const users = [];
const db = {
	disableLogging: true,
	sessionStore: new session.MemoryStore(),

	user: {
		async verify(info) {
			return typeof info.username === "string" && typeof info.password === "string";
		},

		async add(info) {
			return users.push(info) - 1;
		},

		async find(username) {
			for(let i in users) {
				if(users[i].username === username) {
					return i;
				}
			}
			return null;
		},

		async getPassword(id) {
			return users[id].password;
		},

		async setPassword(id, password) {
			users[id].password = password;
		},

		async getInfo(id) {
			return {username: users[id].username};
		},

		async updateInfo(id, info) {
			users[id].username = info.username;
		}
	}
};
const config = JSON.parse(fs.readFileSync("config.template.json"));

const app = require("../src/app.js")(config, db);
const assert = require("assert");
const request = require("supertest");

describe("User API", () => {
	const agent = request.agent(app);

	describe("GET /user/add", () => {
		it("fails on missing data", (done) => {
			request(app)
				.post("/user/add")
				.send({})
				.expect(400, done);
		});

		it("succeeds with valid data", (done) => {
			agent.post("/user/add")
				.send({username: "user", password: "pass"})
				.expect(200, {success: true}, done);
		});

		it("adds the user to the database", () => {
			assert.equal(users[0].username, "user");
		});

		it("hashes the password", () => {
			assert.notEqual(users[0].password, "pass");
		});

		it("sets the session cookie", (done) => {
			agent.get("/user/info")
				.expect(200, done);
		});

		it("fails with an existing username", (done) => {
			request(app)
				.post("/user/add")
				.send({username: "user", password: "pass"})
				.expect(200, {success: false}, done);
		});
	});

	describe("GET /user/logout", () => {
		it("clears the session cookie", (done) => {
			agent.get("/user/logout")
				.end(() => {
					agent.get("/user/info")
						.expect(401, done);
				});
		});
	});

	describe("GET /user/login", () => {
		it("fails on missing data", (done) => {
			request(app)
				.post("/user/login")
				.send({})
				.expect(400, done);
		});

		it("fails for a nonexistent user", (done) => {
			request(app)
				.post("/user/login")
				.send({username: "x", password: "pass"})
				.expect(200, {success: false}, done);
		});

		it("fails with an incorrect password", (done) => {
			request(app)
				.post("/user/login")
				.send({username: "user", password: "x"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with correct credentials", (done) => {
			agent.post("/user/login")
				.send({username: "user", password: "pass"})
				.expect(200, {success: true}, done);
		});

		it("sets the session cookie", (done) => {
			agent.get("/user/info")
				.expect(200, done);
		});
	});

	describe("GET /user/info", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/user/info")
				.expect(401, done);
		});

		it("returns the correct information", (done) => {
			agent.get("/user/info")
				.expect(200, {username: "user"}, done);
		});
	});

	describe("POST /user/info", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/user/info")
				.send({username: "new"})
				.expect(401, done);
		});

		it("updates the user information", (done) => {
			agent.post("/user/info")
				.send({username: "new"})
				.expect(200)
				.end(() => {
					assert.equal(users[0].username, "new");
					done();
				});
		});
	});

	describe("POST /user/password", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/user/password")
				.send({old: "pass", new: "new"})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/user/password")
				.send({})
				.expect(400, done);
		});

		it("fails with an incorrect password", (done) => {
			agent.post("/user/password")
				.send({old: "x", new: "new"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with the correct password", (done) => {
			agent.post("/user/password")
				.send({old: "pass", new: "new"})
				.expect(200, {success: true}, done);
		});

		it("updates the password", (done) => {
			request(app)
				.post("/user/login")
				.send({username: "new", password: "new"})
				.expect(200, {success: true}, done);
		});
	});
});
