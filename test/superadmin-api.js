const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const app = require("../src/app.js")(config, db, coins);
const request = require("supertest");

describe("Super Admin API", () => {
	const agent = request.agent(app);
	let password;

	describe("GET /superadmin/login", () => {
		it("fails on missing data", (done) => {
			request(app)
				.post("/superadmin/login")
				.send({})
				.expect(400, done);
		});

		it("fails for a nonexistent admin", (done) => {
			request(app)
				.post("/superadmin/login")
				.send({username: "x", password: "pass"})
				.expect(200, {success: false}, done);
		});

		it("fails with an incorrect password", (done) => {
			request(app)
				.post("/superadmin/login")
				.send({username: "admin", password: "x"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with correct credentials", (done) => {
			agent.post("/superadmin/login")
				.send({username: "admin", password: "admin"})
				.expect(200, {success: true}, done);
		});

		it("sets the session cookie", (done) => {
			agent.get("/superadmin/info")
				.expect(200, done);
		});
	});

	describe("GET /superadmin/info", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/superadmin/info")
				.expect(401, done);
		});

		it("returns the correct information", (done) => {
			agent.get("/superadmin/info")
				.expect(200, {
					username: "admin",
					email: "admin@erp.coin",
					name: "John",
					surname: "Smith"
				}, done);
		});
	});

	describe("POST /superadmin/update", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/superadmin/update")
				.send({
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe"
				})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/superadmin/update")
				.send({})
				.expect(400, done);
		});

		it("updates the admin information", (done) => {
			agent.post("/superadmin/update")
				.send({
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe"
				})
				.expect(200)
				.end(() => {
					agent.get("/superadmin/info")
						.expect(200, {
							username: "admin",
							email: "new@erp.coin",
							name: "Jane",
							surname: "Doe"
						}, done);
				});
		});
	});

	describe("POST /superadmin/password", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/superadmin/password")
				.send({old: "admin", new: "new"})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/superadmin/password")
				.send({})
				.expect(400, done);
		});

		it("fails with an incorrect password", (done) => {
			agent.post("/superadmin/password")
				.send({old: "x", new: "new"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with the correct password", (done) => {
			agent.post("/superadmin/password")
				.send({old: "admin", new: "new"})
				.expect(200, {success: true}, done);
		});

		it("updates the password", (done) => {
			request(app)
				.post("/superadmin/login")
				.send({username: "admin", password: "new"})
				.expect(200, {success: true}, done);
		});
	});

	describe("POST /superadmin/add", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/superadmin/add")
				.send({
					username: "new",
					email: "newer@erp.coin",
					name: "John",
					surname: "Doe"
				})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/superadmin/add")
				.send({})
				.expect(400, done);
		});

		it("fails with an existing username", (done) => {
			agent.post("/superadmin/add")
				.send({
					username: "admin",
					email: "newer@erp.coin",
					name: "John",
					surname: "Doe"
				})
				.expect(200, {success: false}, done);
		});

		it("succeeds with valid data", (done) => {
			agent.post("/superadmin/add")
				.send({
					username: "new",
					email: "newer@erp.coin",
					name: "John",
					surname: "Doe"
				})
				.expect((res) => {
					assert.equal(res.body.success, true);
					password = res.body.password;
				})
				.expect(200, done);
		});

		it("returns the generated password", (done) => {
			request(app)
				.post("/superadmin/login")
				.send({username: "new", password})
				.expect(200, {success: true}, done);
		});

		it("hashes the password", async() => {
			assert.notEqual(await db.superadmin.getPassword(1), password);
		});
	});

	describe("GET /superadmin/list", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/superadmin/list")
				.expect(401, done);
		});

		it("returns a list of admins", (done) => {
			agent.get("/superadmin/list")
				.expect(200, {
					admins: [
						{
							username: "admin",
							email: "new@erp.coin",
							name: "Jane",
							surname: "Doe"
						},
						{
							username: "new",
							email: "newer@erp.coin",
							name: "John",
							surname: "Doe"
						}
					]
				}, done);
		});
	});

	describe("GET /superadmin/remove/:superadmin", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/superadmin/remove/1")
				.expect(401, done);
		});

		it("fails for an invalid admin ID", (done) => {
			agent.get("/superadmin/remove/2")
				.expect(404, done);
		});

		it("fails for the current admin", (done) => {
			agent.get("/superadmin/remove/0")
				.expect(400, done);
		});

		it("succeeds for another admin", (done) => {
			agent.get("/superadmin/remove/1")
				.expect(200, done);
		});

		it("removes the admin from the database", async() => {
			assert.equal(await db.superadmin.find("new"), null);
		});
	});

	describe("GET /superadmin/logout", () => {
		it("clears the session cookie", (done) => {
			agent.get("/superadmin/logout")
				.end(() => {
					agent.get("/superadmin/info")
						.expect(401, done);
				});
		});
	});
});
