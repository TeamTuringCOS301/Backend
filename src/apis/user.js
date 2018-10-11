const bcrypt = require("bcrypt");
const express = require("express");
const objects = require("../objects.js");
const Web3 = require("web3");
const validator = require("../validate.js");

module.exports = (config, db, coins, sendMail) => {
	const auth = require("../auth.js")(db);

	async function validate(info, initial = true) {
		return (!initial
				|| validator.validateUsername(info.username)
				&& validator.validatePassword(info.password))
			&& validator.validateEmail(info.email)
			&& validator.validateName(info.name)
			&& validator.validateName(info.surname);
	}

	const api = express();
	objects.addParams(api, db);

	api.post("/add", async(req, res) => {
		if(!await validate(req.body)) {
			return res.sendStatus(400);
		}
		let success = false;
		if(await db.user.find(req.body.username) === null) {
			req.body.password = await bcrypt.hash(req.body.password, 10);
			await db.user.add(req.body);
			req.session.userId = await db.user.find(req.body.username);
			success = true;
		}
		res.send({success});
	});

	api.post("/login", async(req, res) => {
		if(typeof req.body.username !== "string" || typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		const id = await db.user.find(req.body.username);
		if(id !== null) {
			const hash = await db.user.getPassword(id);
			if(await bcrypt.compare(req.body.password, hash)) {
				req.session.userId = id;
				success = true;
			}
		}
		res.send({success});
	});

	api.get("/logout", async(req, res) => {
		await auth.requireUser(req);
		delete req.session.userId;
		res.send({});
	});

	api.get("/info", async(req, res) => {
		await auth.requireUser(req);
		const info = await db.user.getInfo(req.userId);
		if(typeof info.walletAddress === "string") {
			info.coinBalance = await coins.getBalance(info.walletAddress);
		}
		res.send(info);
	});

	api.post("/update", async(req, res) => {
		await auth.requireUser(req);
		if(!await validate(req.body, false)) {
			return res.sendStatus(400);
		}
		await db.user.updateInfo(req.userId, req.body);
		res.send({});
	});

	api.post("/address", async(req, res) => {
		await auth.requireUser(req);
		if(!req.body.walletAddress) {
			await db.user.clearWalletAddress(req.userId);
		} else if(Web3.utils.isAddress(req.body.walletAddress)) {
			await coins.rewardCoins(req.body.walletAddress,
				await db.user.getUnclaimedBalance(req.userId));
			await db.user.setWalletAddress(req.userId, req.body.walletAddress);
		} else {
			return res.sendStatus(400);
		}
		res.send({});
	});

	api.post("/password", async(req, res) => {
		await auth.requireUser(req);
		if(typeof req.body.old !== "string" || typeof req.body.new !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.user.getPassword(req.userId);
		if(await bcrypt.compare(req.body.old, hash)) {
			hash = await bcrypt.hash(req.body.new, 10);
			await db.user.setPassword(req.userId, hash);
			success = true;
		}
		res.send({success});
	});

	api.post("/remove", async(req, res) => {
		await auth.requireUser(req);
		if(typeof req.body.password !== "string") {
			return res.sendStatus(400);
		}
		let success = false;
		let hash = await db.user.getPassword(req.userId);
		if(await bcrypt.compare(req.body.password, hash)) {
			await db.user.remove(req.userId);
			delete req.session.userId;
			success = true;
		}
		res.send({success});
	});

	return api;
};
