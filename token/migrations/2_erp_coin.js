var ERPCoin = artifacts.require("./ERPCoin.sol");

module.exports = function(deployer) {
	deployer.deploy(ERPCoin);
};
