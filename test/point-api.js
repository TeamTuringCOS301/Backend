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
		it("fails without a login session", (done) => {
			db.area.add({
				name: "Area",
				city: "City",
				province: "Province",
				middle: {lat: 0, lng: 0},
				border: [{lat: 0, lng: 1}, {lat: 1, lng: 0}, {lat: 0, lng: -1}, {lat: -1, lng: 0}]
			}).then(() => {
				request(app)
					.post("/point/add/0")
					.send({lat: 0, lng: 0})
					.expect(401, done);
			});
		});

		it("fails on missing data", (done) => {
			db.user.add({
				username: "user",
				email: "user@erp.coin",
				password: "$2b$10$uBqGjmP2TsuY2sopGVK9se01Anrr8JG./mqF6fAXcDIXWYWAEfYSm",
				name: "John",
				surname: "Smith"
			}).then(() => {
				agent.post("/user/login")
					.send({username: "user", password: "pass"})
					.expect(200, () => {
						agent.post("/point/add/0")
							.send({})
							.expect(400, done);
					});
			});
		});

		it("fails outside a conservation area", (done) => {
			agent.post("/point/add/0")
				.send({lat: 1, lng: 1})
				.expect(418, done);
		});

		it("succeeds inside a conservation area", (done) => {
			agent.post("/point/add/0")
				.send({lat: 0, lng: 0})
				.expect((res) => {
					assert.equal(typeof res.body.coin, "boolean");
				})
				.expect(200, done);
		});

		it("rejects points sent too quickly", (done) => {
			agent.post("/point/add/0")
				.send({lat: 0, lng: 0})
				.expect(400, done);
		});
	});

	describe("GET /point/list/:area/:since", () => {
		it("fails with invalid area ID", (done) => {
			request(app).get("/point/list/1/0")
				.expect(404, done);
		});

		it("returns a list of points", (done) => {
			db.point.list(0, 0).then((points) => {
				request(app).get("/point/list/0/0")
					.expect(200, {
						points: [{lat: 0, lng: 0}],
						latest: points[0].time
					}, done);
			});
		});

		it("only returns points newer than given time", (done) => {
			db.point.list(0, 0).then((points) => {
				request(app).get(`/point/list/0/${points[0].time}`)
					.expect(200, {
						points: [],
						latest: points[0].time
					}, done);
			});
		});
	});
});
