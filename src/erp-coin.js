const fs = require("fs");
const solc = require("solc");

const result = solc.compile({
	sources: {
		"StandardToken.sol": fs.readFileSync("contracts/StandardToken.sol", "utf8"),
		"ERPCoin.sol": fs.readFileSync("contracts/ERPCoin.sol", "utf8")
	}
}, 1);

if(result.errors !== undefined) {
	for(let err of result.errors) {
		console.error(err);
	}
	process.exit();
}

module.exports = {
	abi: JSON.parse(result.contracts["ERPCoin.sol:ERPCoin"].interface),
	bytecode: result.contracts["ERPCoin.sol:ERPCoin"].bytecode
};
