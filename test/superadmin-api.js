const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const request = require("supertest");
const sendMail = require("./mock-email.js")();
const app = require("../src/app.js")(config, db, coins, sendMail);

describe("Super Admin API", () => {
	const agent = request.agent(app);

	describe("GET /superadmin/login", () => {
		it("fails on missing data", async() => {
			await request(app)
				.post("/superadmin/login")
				.send({})
				.expect(400);
		});

		it("fails for a nonexistent admin", async() => {
			await request(app)
				.post("/superadmin/login")
				.send({username: "x", password: "admin"})
				.expect(200, {success: false});
		});

		it("fails with an incorrect password", async() => {
			await request(app)
				.post("/superadmin/login")
				.send({username: "admin", password: "x"})
				.expect(200, {success: false});
		});

		it("succeeds with correct credentials", async() => {
			await agent.post("/superadmin/login")
				.send({username: "admin", password: "admin"})
				.expect(200, {success: true});
		});

		it("sets the session cookie", async() => {
			await agent.get("/superadmin/info")
				.expect(200);
		});
	});

	describe("GET /superadmin/info", () => {
		it("fails without a login session", async() => {
			await request(app)
				.get("/superadmin/info")
				.expect(401);
		});

		it("returns the correct information", async() => {
			await agent.get("/superadmin/info")
				.expect(200, {
					username: "admin",
					email: "admin@erp.coin",
					name: "John",
					surname: "Smith"
				});
		});
	});

	describe("POST /superadmin/update", () => {
		it("fails without a login session", async() => {
			await request(app)
				.post("/superadmin/update")
				.send({
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe"
				})
				.expect(401);
		});

		it("fails on missing data", async() => {
			await agent.post("/superadmin/update")
				.send({})
				.expect(400);
		});

		it("succeeds with valid data", async() => {
			await agent.post("/superadmin/update")
				.send({
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe"
				})
				.expect(200);
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
		it("fails without a login session", async() => {
			await request(app)
				.post("/superadmin/password")
				.send({old: "admin", new: "new"})
				.expect(401);
		});

		it("fails on missing data", async() => {
			await agent.post("/superadmin/password")
				.send({})
				.expect(400);
		});

		it("fails with an incorrect password", async() => {
			await agent.post("/superadmin/password")
				.send({old: "x", new: "new"})
				.expect(200, {success: false});
		});

		it("succeeds with the correct password", async() => {
			await agent.post("/superadmin/password")
				.send({old: "admin", new: "new"})
				.expect(200, {success: true});
		});

		it("updates the password", async() => {
			await request(app)
				.post("/superadmin/login")
				.send({username: "admin", password: "new"})
				.expect(200, {success: true});
		});
	});

	describe("GET /superadmin/logout", () => {
		it("returns successfully", async() => {
			await agent.get("/superadmin/logout")
				.expect(200);
		});

		it("clears the session cookie", async() => {
			await agent.get("/superadmin/info")
				.expect(401);
		});
	});
});
