const database = require("./database.js");
const express = require("express");
const token = require("./token.js");

const app = express();
app.use(express.json());

app.post("/user/add", (req, res) => {
	// This code will be executed when a POST request is received for the path /user/add.
	// Other methods such as GET, PUT and DELETE are also available.
	// JSON in the request body will be parsed and made available in req.body.
	if(typeof req.body.username === "string") {
		// A response is sent like this. Note that the object will automatically be converted to JSON.
		res.send({success: true});
	} else {
		// An error code may also be specified.
		res.status(400).send({success: false});
	}
});

app.get("/user/:id(\\d+)", async (req, res) => {
	// This is for a GET request to /user/<id>, where <id> is a parameter consisting of digits.
	// It may be accessed using req.params.
	// This also demonstrates using await to get the value of the Promise returned by database.getUser().
	// Note the required async keyword above.
	// If the Promise is rejected (because the query failed), an exception will be thrown.
	try {
		res.send(await database.getUser(req.params.id));
	} catch(error) {
		res.status(404).send({username: null});
	}
});

app.get("/user/:id(\\d+)/balance", async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		res.send({id, balance: await token.getBalance(id)});
	} catch(err) {
		console.log(err);
		res.status(404).send({});
	}
});

app.listen(8080); // TODO: Use HTTPS.
