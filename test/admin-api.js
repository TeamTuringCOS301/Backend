const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const app = require("../src/app.js")(config, db, coins);
const request = require("supertest");

describe("Admin API", () => {
	const agent = request.agent(app);
	const superagent = request.agent(app);
	let password;

	describe("POST /admin/add", () => {
		it("fails without a login session", (done) => {
			db.area.add({}).then(() => {
				request(app)
					.post("/admin/add")
					.send({
						username: "new",
						email: "new@erp.coin",
						name: "Jane",
						surname: "Doe",
						area: 0
					})
					.expect(401, done);
			});
		});

		it("fails on missing data", (done) => {
			superagent.post("/superadmin/login")
				.send({username: "admin", password: "admin"})
				.end(() => {
					superagent.post("/admin/add")
						.send({})
						.expect(400, done);
				});
		});

		it("fails with invalid area ID", (done) => {
			superagent.post("/admin/add")
				.send({
					username: "new",
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					area: 1
				})
				.expect(400, done);
		});

		it("succeeds with valid data", (done) => {
			superagent.post("/admin/add")
				.send({
					username: "new",
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					area: 0
				})
				.expect((res) => {
					assert.equal(res.body.success, true);
					password = res.body.password;
				})
				.expect(200, done);
		});

		it("returns the generated password", (done) => {
			agent.post("/admin/login")
				.send({username: "new", password})
				.expect(200, {success: true}, done);
		});

		it("hashes the password", async() => {
			assert.notEqual(await db.admin.getPassword(0), password);
		});

		it("fails with an existing username", (done) => {
			superagent.post("/admin/add")
				.send({
					username: "new",
					email: "newer@erp.coin",
					name: "John",
					surname: "Smith",
					area: 0
				})
				.expect(200, {success: false}, done);
		});
	});

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
				.send({username: "x", password})
				.expect(200, {success: false}, done);
		});

		it("fails with an incorrect password", (done) => {
			request(app)
				.post("/admin/login")
				.send({username: "new", password: "x"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with correct credentials", (done) => {
			agent.post("/admin/login")
				.send({username: "new", password})
				.expect(200, {success: true}, done);
		});

		it("sets the session cookie", (done) => {
			agent.get("/admin/info")
				.expect(200, done);
		});
	});

	describe("GET /admin/info", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/admin/info")
				.expect(401, done);
		});

		it("returns the correct information", (done) => {
			agent.get("/admin/info")
				.expect(200, {
					username: "new",
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					area: 0
				}, done);
		});
	});

	describe("POST /admin/update", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/admin/update")
				.send({
					email: "newer@erp.coin",
					name: "John",
					surname: "Smith"
				})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/admin/update")
				.send({})
				.expect(400, done);
		});

		it("updates the admin information", (done) => {
			agent.post("/admin/update")
				.send({
					email: "newer@erp.coin",
					name: "John",
					surname: "Smith"
				})
				.expect(200)
				.end(() => {
					agent.get("/admin/info")
						.expect(200, {
							username: "new",
							email: "newer@erp.coin",
							name: "John",
							surname: "Smith",
							area: 0
						}, done);
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
			agent.post("/admin/password")
				.send({})
				.expect(400, done);
		});

		it("fails with an incorrect password", (done) => {
			agent.post("/admin/password")
				.send({old: "x", new: "new"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with the correct password", (done) => {
			agent.post("/admin/password")
				.send({old: password, new: "new"})
				.expect(200, {success: true}, done);
		});

		it("updates the password", (done) => {
			request(app)
				.post("/admin/login")
				.send({username: "new", password: "new"})
				.expect(200, {success: true}, done);
		});
	});

	describe("GET /admin/list", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/admin/list")
				.expect(401, done);
		});

		it("returns a list of admins", (done) => {
			superagent.get("/admin/list")
				.expect(200, {
					admins: [
						{
							username: "new",
							email: "newer@erp.coin",
							name: "John",
							surname: "Smith",
							area: 0
						}
					]
				}, done);
		});
	});

	describe("GET /admin/remove/:admin", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/admin/remove/0")
				.expect(401, done);
		});

		it("fails for an invalid admin ID", (done) => {
			superagent.get("/admin/remove/1")
				.expect(404, done);
		});

		it("succeeds for a valid admin ID", (done) => {
			superagent.get("/admin/remove/0")
				.expect(200, done);
		});

		it("removes the admin from the database", async() => {
			assert.equal(await db.admin.find("new"), null);
		});
	});

	describe("GET /admin/logout", () => {
		it("clears the session cookie", (done) => {
			agent.get("/admin/logout")
				.end(() => {
					agent.get("/admin/info")
						.expect(401, done);
				});
		});
	});
});
