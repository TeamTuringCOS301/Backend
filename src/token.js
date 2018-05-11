const contract = require('truffle-contract');
const fs = require('fs');
const Web3 = require('web3');

const provider = new Web3.providers.HttpProvider("http://localhost:9545");
if(typeof provider.sendAsync !== "function") {
	provider.sendAsync = (...args) => provider.send(...args);
}

const contracts = {};
async function getContract(name) {
	if(contracts[name]) {
		return contracts[name];
	} else {
		const c = contract(JSON.parse(fs.readFileSync(`token/build/contracts/${name}.json`)));
		c.setProvider(provider);
		return contracts[name] = await c.deployed();
	}
}

// TODO: This should be read from the database.
function getUserAddress(id) {
	const addresses = [
		"0x627306090abab3a6e1400e9345bc60c78a8bef57",
		"0xf17f52151ebef6c7334fad080c5704d77216b732",
		"0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef",
		"0x821aea9a577a9b44299b9c15c88cf3087f3b5544",
		"0x0d1d4e623d10f9fba5db95830f7d3839406c6af2",
		"0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e",
		"0x2191ef87e392377ec08e7c08eb105ef5448eced5",
		"0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5",
		"0x6330a553fc93768f612722bb8c2ec78ac90b3bbc",
		"0x5aeda56215b167893e80b4fe645ba6d5bab767de",
	];
	if(id < addresses.length) {
		return addresses[id];
	} else {
		throw new Error();
	}
}

exports.getBalance = async(id) => {
	const ERPCoin = await getContract("ERPCoin");
	const address = getUserAddress(id);
	return (await ERPCoin.balanceOf(address)).toNumber();
};
