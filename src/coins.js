const config = require("./config.js");
const Contract = require("truffle-contract");
const fs = require("fs");
const Web3 = require("web3");

const provider = new Web3.providers.HttpProvider(config.web3Provider);
if(typeof provider.sendAsync !== "function") {
	provider.sendAsync = (...args) => provider.send(...args);
}
const contractJson = JSON.parse(fs.readFileSync("token/build/contracts/ERPCoin.json"));
const ERPCoin = Contract(contractJson);
ERPCoin.setProvider(provider);

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
