const config = require("./config.js");
const Contract = require("truffle-contract");
const db = require("./database.js");
const email = require("./email.js");
const fs = require("fs");
const Web3 = require("web3");

const provider = new Web3.providers.HttpProvider(config.web3Provider);
if(typeof provider.sendAsync !== "function") {
	provider.sendAsync = (...args) => provider.send(...args);
}
const contractJson = JSON.parse(fs.readFileSync("token/build/contracts/ERPCoin.json"));
const ERPCoin = Contract(contractJson);
ERPCoin.setProvider(provider);

async function sendMail(user, subject, message) {
	await email.sendMail({
		from: "erp.erpcoin@gmail.com",
		to: user.email,
		subject,
		text: `Hi ${user.name},\n\n${message}\n\nKind regards,\nERP-Coin team`
	});
}

ERPCoin.deployed().then((contract) => {
	contract.Purchase().watch(async(err, purchase) => {
		if(err) {
			return console.error(err);
		}

		const owner = await contract.owner();
		const refund = () =>
			contract.rewardCoins(purchase.args.buyer, purchase.args.value, {from: owner});

		const userId = await db.user.findByAddress(purchase.args.buyer);
		if(userId === null) {
			return await refund();
		}
		const user = await db.user.getInfo(userId);

		const rewardId = purchase.args.reward.toNumber();
		if(!await db.reward.validId(rewardId)) {
			await refund();
			return await sendRewardMail(user, "ERP-Coin Reward Not Available",
				"The reward you attempted to buy is not currently available.\n\n"
					+ "Sorry for the inconvenience. Your coins have been refunded.");
		}
		const reward = await db.reward.getInfo(rewardId);
		if(purchase.value.toNumber() !== reward.coinValue || !reward.verified) {
			await refund();
			return await sendRewardMail(user, "ERP-Coin Reward Not Available",
				"The reward you attempted to buy is not currently available.\n\n"
					+ "Sorry for the inconvenience. Your coins have been refunded.");
		}

		if(reward.amount === 1) {
			await db.reward.remove(rewardId);
		} else if(reward.amount !== -1) {
			await db.reward.setAmount(rewardId, reward.amount - 1);
		}
		await sendRewardEmail(user, "ERP-Coin Reward Purchased",
			"You have successfully purchased the following reward.\n\n"
				+ `Reward: ${reward.name}\n`
				+ `${reward.description}\n\n`
				+ `Value: R ${reward.randValue.toFixed(2)}\n`
				+ `Price: ${reward.coinValue} coins\n`
				+ `Offered by: ${reward.areaName}`);
	});
});

module.exports = {
	contractJson,

	async getBalance(address) {
		const contract = await ERPCoin.deployed();
		return (await contract.balanceOf(address)).toNumber();
	},

	async rewardCoins(address, coins) {
		const contract = await ERPCoin.deployed();
		await contract.rewardCoins(address, coins, {from: await contract.owner()});
	}
};
