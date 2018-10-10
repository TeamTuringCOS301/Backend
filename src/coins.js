const config = require("./config.js");
const db = require("./database.js");
const fs = require("fs");
const generator = require("generate-password");
const imageType = require("image-type");
const onExit = require("./on-exit.js");
const sendMail = require("./email.js");
const Web3 = require("web3");

const web3 = new Web3(config.token.rpc);
onExit(() => web3.currentProvider.disconnect());

const abi = JSON.parse(fs.readFileSync("token/build/contracts/ERPCoin.json")).abi;
const contract = new web3.eth.Contract(abi, config.token.contract);

async function rewardPurchaseDone(user, reward) {
	const image = await db.reward.getImage(reward.id);
	if(reward.amount === 1) {
		await db.reward.remove(reward.id);
	} else if(reward.amount !== -1) {
		await db.reward.setAmount(reward.id, reward.amount - 1);
	}
	const admin = await db.admin.getInfo(await db.area.getPrimaryAdmin(reward.area));
	const purchaseId = generator.generate();
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

	contract.events.Purchase({}, {fromBlock: lastPurchase.blockNumber}, async(err, purchase) => {
		if(err) {
			console.error(err);
			return;
		} else if(purchase.blockNumber == lastPurchase.blockNumber
				&& purchase.logIndex <= lastPurchase.logIndex) {
			return;
		}
		await db.setLastPurchase(purchase);

		if(config.logRequests) {
			console.log(`Purchase(${purchase.returnValues.buyer}, ${purchase.returnValues.reward}, `
				+ `${purchase.returnValues.value})`);
			console.log();
		}

		const owner = await contract.methods.owner().call();
		const refund = () =>
			contract.methods.rewardCoins(purchase.returnValues.buyer, purchase.returnValues.value)
				.send({from: owner});

		const userId = await db.user.findByAddress(purchase.returnValues.buyer);
		if(userId === null) {
			return await refund();
		}
		const user = await db.user.getInfo(userId);

		const rewardId = Number.parseInt(purchase.returnValues.reward);
		if(!await db.reward.validId(rewardId)) {
			await refund();
			return sendMail(user, "ERP-Coin Reward Not Available",
				"The reward you attempted to buy is not currently available.\n\n"
					+ "Sorry for the inconvenience. Your coins have been refunded.");
		}
		const reward = await db.reward.getInfo(rewardId);
		if(Number.parseInt(purchase.returnValues.value) !== reward.coinValue || !reward.verified
				|| await db.area.getPrimaryAdmin(reward.area) === null) {
			await refund();
			return sendMail(user, "ERP-Coin Reward Not Available",
				"The reward you attempted to buy is not currently available.\n\n"
					+ "Sorry for the inconvenience. Your coins have been refunded.");
		}

		reward.id = rewardId;
		await rewardPurchaseDone(user, reward);
	});
}
handlePurchases();

module.exports = {
	async getContractJson() {
		return {abi, address: config.token.contract};
	},

	async getBalance(address) {
		return Number.parseInt(await contract.methods.balanceOf(address).call());
	},

	async rewardCoins(address, coins) {
		await contract.methods.rewardCoins(address, coins)
			.send({from: await contract.methods.owner().call()});
	},

	rewardPurchaseDone
};
