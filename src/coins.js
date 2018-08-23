const config = require("./config.js");
const Contract = require("truffle-contract");
const fs = require("fs");
const Web3 = require("web3");

const provider = new Web3.providers.HttpProvider(config.web3Provider);
if(typeof provider.sendAsync !== "function") {
	provider.sendAsync = (...args) => provider.send(...args);
}
const ERPCoin = Contract(JSON.parse(fs.readFileSync("token/build/contracts/ERPCoin.json")));
ERPCoin.setProvider(provider);

module.exports = {
	async getBalance(address) {
		const contract = await ERPCoin.deployed();
		return (await contract.balanceOf(address)).toNumber();
	},

	async getTotalEarned(address) {
		const contract = await ERPCoin.deployed();
		return (await contract.totalEarned(address)).toNumber();
	},

	async rewardCoin(address) {
		const contract = await ERPCoin.deployed();
		await contract.rewardCoin(address, {from: await contract.owner()});
	}
};
