const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const request = require("supertest");
const sendMail = require("./mock-email.js")();
const app = require("../src/app.js")(config, db, coins, sendMail);

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
				.send({username: "x", password: "admin"})
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

		it("succeeds with valid data", (done) => {
			agent.post("/superadmin/update")
				.send({
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe"
				})
				.expect(200, done);
		});

		it("updates the admin information", async() => {
			assert.deepEqual(await db.superadmin.getInfo(await db.superadmin.find("admin")), {
				username: "admin",
				email: "new@erp.coin",
				name: "Jane",
				surname: "Doe"
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

	describe("GET /superadmin/logout", () => {
		it("returns successfully", (done) => {
			agent.get("/superadmin/logout")
				.expect(200, done);
		});

		it("clears the session cookie", (done) => {
			agent.get("/superadmin/info")
				.expect(401, done);
		});
	});
});
