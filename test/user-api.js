const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const app = require("../src/app.js")(config, db, coins);
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
				.send({
					username: "user",
					email: "user@erp.coin",
					password: "pass",
					name: "John",
					surname: "Smith",
					walletAddress: "0x0"
				})
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
				.send({
					username: "user",
					email: "user@erp.coin",
					password: "pass",
					name: "John",
					surname: "Smith",
					walletAddress: "0x0"
				})
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
				.expect(200, {
					username: "user",
					email: "user@erp.coin",
					name: "John",
					surname: "Smith",
					walletAddress: "0x0"
				}, done);
		});
	});

	describe("POST /user/update", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/user/update")
				.send({
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					walletAddress: "0x0"
				})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/user/update")
				.send({})
				.expect(400, done);
		});

		it("updates the user information", (done) => {
			agent.post("/user/update")
				.send({
					email: "new@erp.coin",
					name: "Jane",
					surname: "Doe",
					walletAddress: "0x0"
				})
				.expect(200)
				.end(() => {
					agent.get("/user/info")
						.expect(200, {
							username: "user",
							email: "new@erp.coin",
							name: "Jane",
							surname: "Doe",
							walletAddress: "0x0"
						}, done);
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
				.send({username: "user", password: "new"})
				.expect(200, {success: true}, done);
		});
	});

	describe("GET /user/coins", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/user/coins")
				.expect(401, done);
		});

		it("returns the balance", (done) => {
			agent.get("/user/coins")
				.expect(200, {balance: 0, totalEarned: 0}, done);
		});

		it("updates when coins are earned", (done) => {
			coins.rewardCoin("0x0").then(() => {
				agent.get("/user/coins")
					.expect(200, {balance: 1, totalEarned: 1}, done);
			});
		});
	});

	describe("POST /user/remove", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/user/remove")
				.send({password: "pass"})
				.expect(401, done);
		});

		it("fails with an incorrect password", (done) => {
			agent.post("/user/remove")
				.send({password: "x"})
				.expect(200, {success: false}, done);
		});

		it("succeeds with the correct password", (done) => {
			agent.post("/user/remove")
				.send({password: "new"})
				.expect(200, {success: true}, done);
		});

		it("removes the user account", async() => {
			assert.equal(await db.user.find("user"), null);
		});
	});
});
