const config = require("./config.js");
const Contract = require("truffle-contract");
const db = require("./database.js");
const fs = require("fs");
const generator = require("generate-password");
const imageType = require("image-type");
const onExit = require("./on-exit.js");
const sendMail = require("./email.js");
const Web3 = require("web3");

const provider = new Web3.providers.HttpProvider(config.web3Provider);
if(typeof provider.sendAsync !== "function") {
	provider.sendAsync = (...args) => provider.send(...args);
}
const ERPCoin = Contract(JSON.parse(fs.readFileSync("token/build/contracts/ERPCoin.json")));
ERPCoin.setProvider(provider);

async function rewardPurchaseDone(user, reward) {
	if(reward.amount === 1) {
		await db.reward.remove(reward.id);
	} else if(reward.amount !== -1) {
		await db.reward.setAmount(reward.id, reward.amount - 1);
	}
	const admin = await db.admin.getInfo(await db.area.getPrimaryAdmin(reward.area));
	const purchaseId = generator.generate();
	const image = await db.reward.getImage(reward.id);
	const attachments = [{filename: `reward.${imageType(image).ext}`, content: image}];
	sendMail(user, "ERP-Coin Reward Purchased",
		"Thank you for buying the following reward.\n\n"
			+ `Reward: ${reward.name}\n`
			+ `${reward.description}\n\n`
			+ `Value: R ${reward.randValue.toFixed(2)}\n`
			+ `Price: ${reward.coinValue} coins\n`
			+ `Offered by: ${reward.areaName}\n\n`
			+ `Please contact the following representative, quoting the purchase ID.\n`
			+ `Name: ${admin.name} ${admin.surname}\n`
			+ `Email: ${admin.email}\n`
			+ `Purchase ID: ${purchaseId}`,
		attachments);
	sendMail(admin, "ERP-Coin Reward Purchased",
		"A user has bought the following reward.\n\n"
			+ `Reward: ${reward.name}\n`
			+ `${reward.description}\n\n`
			+ `Value: R ${reward.randValue.toFixed(2)}\n`
			+ `Price: ${reward.coinValue} coins\n\n`
			+ `Please expect a message from the user, with the following purchase ID.\n`
			+ `Name: ${user.name} ${user.surname}\n`
			+ `Email: ${user.email}\n`
			+ `Purchase ID: ${purchaseId}`,
		attachments);
}

async function handlePurchases() {
	const lastPurchase = await db.getLastPurchase();

	const contract = await ERPCoin.deployed();
	const event = contract.Purchase({}, {fromBlock: lastPurchase.blockNumber});
	event.watch(async(err, purchase) => {
		if(err) {
			return console.error(err);
		} else if(purchase.blockNumber == lastPurchase.blockNumber
				&& purchase.logIndex <= lastPurchase.logIndex) {
			return;
		}
		await db.setLastPurchase(purchase);

		if(config.logRequests) {
			console.log();
			console.log(`Purchase(${purchase.args.buyer}, ${purchase.args.reward.toNumber()}, `
				+ `${purchase.args.value.toNumber()})`);
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
			return sendMail(user, "ERP-Coin Reward Not Available",
				"The reward you attempted to buy is not currently available.\n\n"
					+ "Sorry for the inconvenience. Your coins have been refunded.");
		}
		const reward = await db.reward.getInfo(rewardId);
		if(purchase.args.value.toNumber() !== reward.coinValue || !reward.verified
				|| await db.area.getPrimaryAdmin(reward.area) === null) {
			await refund();
			return sendMail(user, "ERP-Coin Reward Not Available",
				"The reward you attempted to buy is not currently available.\n\n"
					+ "Sorry for the inconvenience. Your coins have been refunded.");
		}

		reward.id = rewardId;
		await rewardPurchaseDone(user, reward);
	});
	onExit(() => event.stopWatching(() => {}));
}
handlePurchases();

module.exports = {
	async getContractJson() {
		const contract = await ERPCoin.deployed();
		return {abi: contract.abi, address: contract.address};
	},

	async getBalance(address) {
		const contract = await ERPCoin.deployed();
		return (await contract.balanceOf(address)).toNumber();
	},

	async rewardCoins(address, coins) {
		const contract = await ERPCoin.deployed();
		await contract.rewardCoins(address, coins, {from: await contract.owner()});
	},

	rewardPurchaseDone
};
