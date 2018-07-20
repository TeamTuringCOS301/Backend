const config = require("./config.js");
const Contract = require("truffle-contract");
const fs = require("fs");
const Web3 = require("web3");

let ERPCoin;
let owner;
async function contractReady() {
	const provider = new Web3.providers.HttpProvider(config.web3Provider);
	if(typeof provider.sendAsync !== "function") {
		provider.sendAsync = (...args) => provider.send(...args);
	}
	const contract = Contract(JSON.parse(fs.readFileSync("token/build/contracts/ERPCoin.json")));
	contract.setProvider(provider);
	ERPCoin = await contract.deployed();
	owner = await ERPCoin.owner();
}

module.exports = {
	async getBalance(address) {
		await contractReady();
		return (await ERPCoin.balanceOf(address)).toNumber();
	},

	async getTotalEarned(address) {
		await contractReady();
		return (await ERPCoin.totalEarned(address)).toNumber();
	},

	async rewardCoin(address) {
		await contractReady();
		await ERPCoin.rewardCoin(address, {from: owner});
	}
};
