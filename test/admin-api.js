const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const request = require("supertest");
const sendMail = require("./mock-email.js")();
const app = require("../src/app.js")(config, db, coins, sendMail);

describe("Admin API", () => {
	const agent = request.agent(app);
	const superagent = request.agent(app);
	let password;

	describe("POST /admin/add", () => {
		it("fails without a login session", async() => {
			await db.area.add({
				name: "Area",
				city: "City",
				province: "Province",
				middle: {lat: 0, lng: 0},
				border: [{lat: 0, lng: 1}, {lat: 1, lng: 0}, {lat: 0, lng: -1}, {lat: -1, lng: 0}]
			});
			await request(app)
				.post("/admin/add")
				.send({
					username: "new",
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					area: 0
				})
				.expect(401);
		});

		it("fails on missing data", async() => {
			await superagent.post("/superadmin/login")
				.send({username: "admin", password: "admin"});
			await superagent.post("/admin/add")
				.send({})
				.expect(400);
		});

		it("fails with invalid area ID", async() => {
			await superagent.post("/admin/add")
				.send({
					username: "new",
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					area: 1
				})
				.expect(400);
		});

		it("succeeds with valid data", async() => {
			await superagent.post("/admin/add")
				.send({
					username: "new",
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					area: 0
				})
				.expect(200, {success: true});
		});

		it("sends an email", async() => {
			assert.equal(sendMail.testLastEmail().user.email, "new@erp.coin");
		});

		it("sends the password via email", async() => {
			const match = /Password: (\w+)/.exec(sendMail.testLastEmail().message);
			assert.notEqual(match, null);
			password = match[1];
		});

		it("sets the correct password", async() => {
			await agent.post("/admin/login")
				.send({username: "new", password})
				.expect(200, {success: true});
		});

		it("hashes the password", async() => {
			assert.notEqual(await db.admin.getPassword(0), password);
		});

		it("fails with an existing username", async() => {
			await superagent.post("/admin/add")
				.send({
					username: "new",
					email: "newer@erp.coin",
					name: "John",
					surname: "Smith",
					area: 0
				})
				.expect(200, {success: false});
		});
	});

	describe("GET /admin/login", () => {
		it("fails on missing data", async() => {
			await request(app)
				.post("/admin/login")
				.send({})
				.expect(400);
		});

		it("fails for a nonexistent admin", async() => {
			await request(app)
				.post("/admin/login")
				.send({username: "x", password})
				.expect(200, {success: false});
		});

		it("fails with an incorrect password", async() => {
			await request(app)
				.post("/admin/login")
				.send({username: "new", password: "x"})
				.expect(200, {success: false});
		});

		it("succeeds with correct credentials", async() => {
			await agent.post("/admin/login")
				.send({username: "new", password})
				.expect(200, {success: true});
		});

		it("sets the session cookie", async() => {
			await agent.get("/admin/info")
				.expect(200);
		});
	});

	describe("GET /admin/info", () => {
		it("fails without a login session", async() => {
			await request(app)
				.get("/admin/info")
				.expect(401);
		});

		it("returns the correct information", async() => {
			await agent.get("/admin/info")
				.expect(200, {
					username: "new",
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					area: 0,
					areaName: "Area"
				});
		});
	});

	describe("POST /admin/update", () => {
		it("fails without a login session", async() => {
			await request(app)
				.post("/admin/update")
				.send({
					email: "newer@erp.coin",
					name: "John",
					surname: "Smith"
				})
				.expect(401);
		});

		it("fails on missing data", async() => {
			await agent.post("/admin/update")
				.send({})
				.expect(400);
		});

		it("succeeds with valid data", async() => {
			await agent.post("/admin/update")
				.send({
					email: "newer@erp.coin",
					name: "John",
					surname: "Smith"
				})
				.expect(200);
		});

		it("updates the admin information", async() => {
			assert.deepEqual(await db.admin.getInfo(await db.admin.find("new")), {
				username: "new",
				email: "newer@erp.coin",
				name: "John",
				surname: "Smith",
				area: 0,
				areaName: "Area"
			});
		});
	});

	describe("POST /admin/password", () => {
		it("fails without a login session", async() => {
			await request(app)
				.post("/admin/password")
				.send({old: password, new: "new"})
				.expect(401);
		});

		it("fails on missing data", async() => {
			await agent.post("/admin/password")
				.send({})
				.expect(400);
		});

		it("fails with an incorrect password", async() => {
			await agent.post("/admin/password")
				.send({old: "x", new: "new"})
				.expect(200, {success: false});
		});

		it("succeeds with the correct password", async() => {
			await agent.post("/admin/password")
				.send({old: password, new: "new"})
				.expect(200, {success: true});
		});

		it("updates the password", async() => {
			await request(app)
				.post("/admin/login")
				.send({username: "new", password: "new"})
				.expect(200, {success: true});
		});
	});

	describe("GET /admin/logout", () => {
		it("returns successfully", async() => {
			await agent.get("/admin/logout")
				.expect(200);
		});

		it("clears the session cookie", async() => {
			await agent.get("/admin/info")
				.expect(401);
		});
	});

	describe("GET /admin/list", () => {
		it("fails without a login session", async() => {
			await request(app)
				.get("/admin/list")
				.expect(401);
		});

		it("returns a list of admins", async() => {
			await superagent.get("/admin/list")
				.expect(200, {
					admins: [
						{
							id: 0,
							username: "new",
							email: "newer@erp.coin",
							name: "John",
							surname: "Smith",
							area: 0,
							areaName: "Area"
						}
					]
				});
		});
	});

	describe("GET /admin/remove/:admin", () => {
		it("fails without a login session", async() => {
			await request(app)
				.get("/admin/remove/0")
				.expect(401);
		});

		it("fails for an invalid admin ID", async() => {
			await superagent.get("/admin/remove/1")
				.expect(404);
		});

		it("succeeds for a valid admin ID", async() => {
			await superagent.get("/admin/remove/0")
				.expect(200);
		});

		it("removes the admin from the database", async() => {
			assert.equal(await db.admin.find("new"), null);
		});
	});
});
