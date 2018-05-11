const session = require("express-session");

const users = [{
	username: "root",
	password: "$2b$10$Je4jhW7cPYREOxsIqmzKXu/ug3eJNOeVv/sOS1AjJ0ljeb99EelNS"
}];
const db = {
	disableLogging: true,
	sessionStore: new session.MemoryStore(),

	admin: {
		async verify(info) {
			return typeof info.username === "string";
		},

		async add(info) {
			return users.push(info) - 1;
		},

		async remove(id) {
			users[id] = {};
		},

		async list() {
			const list = [];
			for(let user of users) {
				if(typeof user.username === "string") {
					list.push({username: user.username});
				}
			}
			return list;
		},

		async find(username) {
			for(let i in users) {
				if(users[i].username === username) {
					return i;
				}
			}
			return null;
		},

		async isSuperAdmin(id) {
			return parseInt(id) === 0;
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

const app = require("../src/app.js")(db);
const assert = require("assert");
const request = require("supertest");

describe("Admin API", () => {
	const agent1 = request.agent(app);
	const agent2 = request.agent(app);
	let password;

	describe("GET /admin/login", () => {
		it("fails on missing data", (done) => {
			request(app)
				.post("/admin/login")
				.send({})
				.expect(400, done);
		});

		it("fails for a nonexistent admin", (done) => {
			request(app)
				.post("/admin/login")
				.send({username: "x", password: "pass"})
				.expect(200, {success: false}, done);
		});

		it("fails with an incorrect password", (done) => {
			request(app)
				.post("/admin/login")
				.send({username: "root", password: "x"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with correct credentials", (done) => {
			agent1.post("/admin/login")
				.send({username: "root", password: "admin"})
				.expect(200, {success: true, superAdmin: true}, done);
		});

		it("sets the session cookie", (done) => {
			agent1.get("/admin/info")
				.expect(200, done);
		});
	});

	describe("GET /admin/add", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/admin/add")
				.send({username: "admin"})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent1.post("/admin/add")
				.send({})
				.expect(400, done);
		});

		it("fails with an existing username", (done) => {
			agent1.post("/admin/add")
				.send({username: "root"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with valid data", (done) => {
			agent1.post("/admin/add")
				.send({username: "admin"})
				.expect((res) => {
					assert.equal(res.body.success, true);
					password = res.body.password;
				})
				.expect(200, done);
		});

		it("returns the generated password", (done) => {
			agent2.post("/admin/login")
				.send({username: "admin", password})
				.expect(200, {success: true, superAdmin: false}, done);
		});

		it("hashes the password", () => {
			assert.notEqual(users[1].password, password);
		});

		it("fails for a regular admin", (done) => {
			agent2.post("/admin/add")
				.send({username: "new"})
				.expect(401, done);
		});
	});

	describe("GET /admin/super", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/admin/super")
				.expect(401, done);
		});

		it("returns true for a super admin", (done) => {
			agent1.get("/admin/super")
				.expect(200, {superAdmin: true}, done);
		});

		it("returns false for a regular admin", (done) => {
			agent2.get("/admin/super")
				.expect(200, {superAdmin: false}, done);
		});
	});

	describe("GET /admin/info", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/admin/info")
				.expect(401, done);
		});

		it("returns the correct information", (done) => {
			agent2.get("/admin/info")
				.expect(200, {username: "admin"}, done);
		});
	});

	describe("POST /admin/info", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/admin/info")
				.send({username: "new"})
				.expect(401, done);
		});

		it("updates the admin information", (done) => {
			agent2.post("/admin/info")
				.send({username: "new"})
				.expect(200)
				.end(() => {
					assert.equal(users[1].username, "new");
					done();
				});
		});
	});

	describe("POST /admin/password", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/admin/password")
				.send({old: password, new: "new"})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent2.post("/admin/password")
				.send({})
				.expect(400, done);
		});

		it("fails with an incorrect password", (done) => {
			agent2.post("/admin/password")
				.send({old: "x", new: "new"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with the correct password", (done) => {
			agent2.post("/admin/password")
				.send({old: password, new: "new"})
				.expect(200, {success: true}, done);
		});

		it("updates the password", (done) => {
			request(app)
				.post("/admin/login")
				.send({username: "new", password: "new"})
				.expect(200, {success: true, superAdmin: false}, done);
		});
	});

	describe("GET /admin/list", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/admin/list")
				.expect(401, done);
		});

		it("fails for a regular admin", (done) => {
			agent2.get("/admin/list")
				.expect(401, done);
		});

		it("returns a list of admins", (done) => {
			agent1.get("/admin/list")
				.expect(200, {admins: [{username: "root"}, {username: "new"}]}, done);
		});
	});

	describe("POST /admin/remove", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/admin/remove")
				.send({username: "new"})
				.expect(401, done);
		});

		it("fails for a regular admin", (done) => {
			agent2.post("/admin/remove")
				.send({username: "new"})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent1.post("/admin/remove")
				.send({})
				.expect(400, done);
		});

		it("fails for a nonexistent username", (done) => {
			agent1.post("/admin/remove")
				.send({username: "x"})
				.expect(200, {success: false}, done);
		});

		it("fails for a super username", (done) => {
			agent1.post("/admin/remove")
				.send({username: "root"})
				.expect(200, {success: false}, done);
		});

		it("succeeds for a regular username", (done) => {
			agent1.post("/admin/remove")
				.send({username: "new"})
				.expect(200, {success: true}, done);
		});

		it("removes the admin from the database", () => {
			assert.equal(users[1].username, undefined);
		});
	});

	describe("GET /admin/logout", () => {
		it("clears the session cookie", (done) => {
			agent1.get("/admin/logout")
				.end(() => {
					agent1.get("/admin/info")
						.expect(401, done);
				});
		});
	});
});
