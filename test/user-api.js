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
			return users[id];
		},

		async updateInfo(id, info) {
			users[id].username = info.username;
		}
	}
};

const app = require("../src/app.js")(db);
const assert = require("assert");
const request = require("supertest");

describe("User API", () => {
	let agent = request.agent(app);

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

		it("adds the user to the database", async() => {
			assert.notEqual(await db.user.find("user"), null);
		});

		it("hashes the password", async() => {
			assert.notEqual(await db.user.getPassword(0), "pass");
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
				.expect((res) => {
					assert.equal(res.body.username, "user");
				})
				.expect(200, done);
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
				.end(async() => {
					assert.equal((await db.user.getInfo(0)).username, "new");
					done();
				});
		});
	});

	describe("POST /user/password", (done) => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/user/password")
				.send({username: "new"})
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
