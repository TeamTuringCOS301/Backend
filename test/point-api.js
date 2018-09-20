const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const request = require("supertest");
const sendMail = require("./mock-email.js")();
const app = require("../src/app.js")(config, db, coins, sendMail);

describe("Point API", () => {
	const agent = request.agent(app);

	describe("GET /point/add/:area", () => {
		it("fails without a login session", async() => {
			await db.area.add({
				name: "Area",
				city: "City",
				province: "Province",
				middle: {lat: 0, lng: 0},
				border: [{lat: 0, lng: 1}, {lat: 1, lng: 0}, {lat: 0, lng: -1}, {lat: -1, lng: 0}]
			});
			await request(app)
				.post("/point/add/0")
				.send({lat: 0, lng: 0})
				.expect(401);
		});

		it("fails on missing data", async() => {
			await db.user.add({
				username: "user",
				email: "user@erp.coin",
				password: "$2b$10$uBqGjmP2TsuY2sopGVK9se01Anrr8JG./mqF6fAXcDIXWYWAEfYSm",
				name: "John",
				surname: "Smith"
			});
			await agent.post("/user/login")
				.send({username: "user", password: "pass"});
			await agent.post("/point/add/0")
				.send({})
				.expect(400);
		});

		it("fails outside a conservation area", async() => {
			await agent.post("/point/add/0")
				.send({lat: 1, lng: 1})
				.expect(418);
		});

		it("succeeds inside a conservation area", async() => {
			const res = await agent.post("/point/add/0")
				.send({lat: 0, lng: 0})
				.expect(200);
			assert.equal(typeof res.body.coin, "boolean");
		});

		it("rejects points sent too quickly", async() => {
			await agent.post("/point/add/0")
				.send({lat: 0, lng: 0})
				.expect(400);
		});
	});

	describe("GET /point/list/:area/:since", () => {
		it("fails with invalid area ID", async() => {
			await request(app)
				.get("/point/list/1/0")
				.expect(404);
		});

		it("returns a list of points", async() => {
			const points = await db.point.list(0, 0);
			await request(app)
				.get("/point/list/0/0")
				.expect(200, {
					points: [{lat: 0, lng: 0}],
					latest: points[0].time
				});
		});

		it("only returns points newer than given time", async() => {
			const points = await db.point.list(0, 0);
			await request(app)
				.get(`/point/list/0/${points[0].time}`)
				.expect(200, {
					points: [],
					latest: points[0].time
				});
		});
	});
});
