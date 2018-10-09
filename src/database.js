const config = require("./config.js");
const mysql = require("mysql");
const session = require("express-session");
const Store = require("express-mysql-session")(session);
const objects = require("./objects.js");

const pool = mysql.createPool(config.mysql);
const sessionStore = new Store({endConnectionOnClose: true}, pool);
function query(...args) {
	return new Promise((resolve, reject) => {
		pool.query(...args, (err, results) => {
			if(err) {
				reject(err);
			} else {
				resolve(results);
			}
		});
	});
}

const db = {
	sessionStore,
	secureCookies: true,

	async getLastPurchase() {
		const results = await query(`
			SELECT lrpBlockNumber, lrpLogIndex
			FROM tblLastRewardPurchase`);
		return {
			blockNumber: results[0].lrpBlockNumber,
			logIndex: results[0].lrpLogIndex
		};
	},

	async setLastPurchase(purchase) {
		await query(`
			UPDATE tblLastRewardPurchase
			SET lrpBlockNumber = ?, lrpLogIndex = ?`,
			[purchase.blockNumber, purchase.logIndex]);
	}
};

for(let object of objects.all) {
	db[object] = require(`./db/${object}.js`)(config, query);
}

module.exports = db;
