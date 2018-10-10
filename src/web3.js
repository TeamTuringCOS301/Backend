const config = require("./config.js");
const net = require("net");
const Web3 = require("web3");

const web3 = new Web3();
if(/^ws(s)?:\/\//i.test(config.token.rpc)) {
	web3.setProvider(new Web3.providers.WebsocketProvider(config.token.rpc));
	web3.disconnect = () => web3.currentProvider.disconnect();
} else {
	web3.setProvider(new Web3.providers.IpcProvider(config.token.rpc, net));
	web3.disconnect = () => {};
}

module.exports = web3;
