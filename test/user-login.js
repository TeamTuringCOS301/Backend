const app = require("../server.js");
const request = require("supertest");

describe("user login", function() {
	it("should accept valid login credentials", function(done) {
		request(app)
			.post("/user/login")
			.send({username: "dummy", password: "dummy"})
			.expect(200, {success: true}, done);
	});

	it("should deny invalid login credentials", function(done) {
		request(app)
			.post("/user/login")
			.send({username: "dummy", password: "incorrect"})
			.expect(200, {success: false}, done);
	});
});
