const assert = require("assert");
const config = require("./mock-config.js");
const coins = require("./mock-coins.js")();
const db = require("./mock-db.js")();
const request = require("supertest");
const sendMail = require("./mock-email.js")();
const app = require("../src/app.js")(config, db, coins, sendMail);

describe("Area API", () => {
	const agent = request.agent(app);

	describe("POST /area/add", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/area/add")
				.send({
					name: "Area",
					city: "City",
					province: "Province",
					border: [{lat: 0, lng: 0}, {lat: 0, lng: 1}, {lat: 1, lng: 1}, {lat: 1, lng: 0}]
				})
				.expect(401, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/superadmin/login")
				.send({username: "admin", password: "admin"})
				.end(() => {
					agent.post("/area/add")
						.send({})
						.expect(400, done);
				});
		});

		it("fails if border is too short", (done) => {
			agent.post("/area/add")
				.send({
					name: "Area",
					city: "City",
					province: "Province",
					border: [{lat: 0, lng: 0}, {lat: 1, lng: 1}]
				})
				.expect(400, done);
		});

		it("succeeds with valid data", (done) => {
			agent.post("/area/add")
				.send({
					name: "Area",
					city: "City",
					province: "Province",
					border: [{lat: 0, lng: 0}, {lat: 0, lng: 1}, {lat: 1, lng: 1}, {lat: 1, lng: 0}]
				})
				.expect(200, done);
		});

		it("calculates the correct middle point", async() => {
			assert.deepEqual((await db.area.getInfo(0)).middle, {lat: 0.5, lng: 0.5});
		});
	});

	describe("GET /area/list", () => {
		it("returns a list of areas", (done) => {
			request(app)
				.get("/area/list")
				.expect(200, {
					areas: [{
						id: 0,
						name: "Area",
						city: "City",
						province: "Province",
						middle: {lat: 0.5, lng: 0.5}
					}]
				}, done);
		});
	});

	describe("GET /area/info/:area", () => {
		it("fails with invalid area ID", (done) => {
			request(app)
				.get("/area/info/1")
				.expect(404, done);
		});

		it("returns the correct information", (done) => {
			request(app)
				.get("/area/info/0")
				.expect(200, {
					name: "Area",
					city: "City",
					province: "Province",
					middle: {lat: 0.5, lng: 0.5},
					border: [{lat: 0, lng: 0}, {lat: 0, lng: 1}, {lat: 1, lng: 1}, {lat: 1, lng: 0}]
				}, done);
		});
	});

	describe("POST /area/update/:area", () => {
		it("fails without a login session", (done) => {
			request(app)
				.post("/area/update/0")
				.send({
					name: "New Area",
					city: "New City",
					province: "New Province",
					border: [{lat: 1, lng: 1}, {lat: 1, lng: 2}, {lat: 2, lng: 2}, {lat: 2, lng: 1}]
				})
				.expect(401, done);
		});

		it("fails with invalid area ID", (done) => {
			agent.post("/area/update/1")
				.send({
					name: "New Area",
					city: "New City",
					province: "New Province",
					border: [{lat: 1, lng: 1}, {lat: 1, lng: 2}, {lat: 2, lng: 2}, {lat: 2, lng: 1}]
				})
				.expect(404, done);
		});

		it("fails on missing data", (done) => {
			agent.post("/area/update/0")
				.send({})
				.expect(400, done);
		});

		it("fails if border is too short", (done) => {
			agent.post("/area/update/0")
				.send({
					name: "New Area",
					city: "New City",
					province: "New Province",
					border: [{lat: 0, lng: 0}, {lat: 1, lng: 1}]
				})
				.expect(400, done);
		});

		it("succeeds with valid data", (done) => {
			agent.post("/area/update/0")
				.send({
					name: "New Area",
					city: "New City",
					province: "New Province",
					border: [{lat: 1, lng: 1}, {lat: 1, lng: 2}, {lat: 2, lng: 2}, {lat: 2, lng: 1}]
				})
				.expect(200, done);
		});

		it("calculates the correct middle point", async() => {
			assert.deepEqual((await db.area.getInfo(0)).middle, {lat: 1.5, lng: 1.5});
		});
	});

	describe("GET /area/remove/:area", () => {
		it("fails without a login session", (done) => {
			request(app)
				.get("/area/remove/0")
				.expect(401, done);
		});

		it("fails with invalid area ID", (done) => {
			agent.get("/area/remove/1")
				.expect(404, done);
		});

		it("succeeds with valid area ID", (done) => {
			agent.get("/area/remove/0")
				.expect(200, done);
		});

		it("removes the area", async() => {
			assert.equal((await db.area.list()).length, 0);
		});
	});
});
