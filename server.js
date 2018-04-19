const database = require("./database.js");
const express = require("express");
const token = require("./token.js");

const app = express();
app.use(express.json());

app.post("/admin/login", async(req, res) => {
	try {
		const success = await database.adminLogin(req.body.username, req.body.password);
		res.send({success});
	} catch(err) {
		res.status(500).send({});
	}
});

app.post("/user/register", async(req, res) => {
	try {
		const success = await database.registerUser(req.body);
		res.send({success});
	} catch(err) {
		res.status(500).send({});
	}
});

app.post("/user/login", async(req, res) => {
	try {
		const success = await database.userLogin(req.body.username, req.body.password);
		res.send({success});
	} catch(err) {
		res.status(500).send({});
	}
});

app.get("/user/:id(\\d+)/balance", async(req, res) => {
	try {
		const id = parseInt(req.params.id);
		res.send({id, balance: await token.getBalance(id)});
	} catch(err) {
		res.status(404).send({});
	}
});

if(require.main === module) {
	app.listen(8080); // TODO: Use HTTPS.
} else {
	module.exports = app;
}
