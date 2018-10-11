const erpCoin = require("./erp-coin.js");
const readline = require("readline");
const web3 = require("./web3.js");

function readInt(prompt) {
	return new Promise((resolve, reject) => {
		const rl = readline.createInterface({input: process.stdin, output: process.stdout});
		rl.question(prompt, (answer) => {
			rl.close();
			resolve(parseInt(answer));
		});
	});
}

async function deploy() {
	const accounts = await web3.eth.getAccounts();
	if(accounts.length === 0) {
		throw "The Ethereum node has no accounts unlocked.";
	}

	console.log("Available accounts:");
	for(let i in accounts) {
		console.log(`#${i} ${accounts[i]}`);
	}

	const i = await readInt("Choose an account to deploy the contract: #");
	if(i < 0 || i >= accounts.length) {
		throw "Invalid index.";
	}

	const deploy = new web3.eth.Contract(erpCoin.abi).deploy({data: erpCoin.bytecode});
	const gas = await deploy.estimateGas();
	const contract = await deploy.send({from: accounts[i], gas});

	console.log(`Contract address: ${contract.options.address}`);
}

deploy().catch(console.error).finally(() => web3.disconnect());
