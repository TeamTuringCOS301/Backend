const assert = require("assert");
const erpCoin = require("../src/erp-coin.js");
const ganache = require("ganache-cli");
const Web3 = require("web3");

async function test() {
	const web3 = new Web3(ganache.provider());

	const accounts = await web3.eth.getAccounts();
	const owner = accounts[0];
	const user1 = accounts[1];
	const user2 = accounts[2];

	const deploy = new web3.eth.Contract(erpCoin.abi).deploy({data: erpCoin.bytecode});
	const gas = await deploy.estimateGas();
	const contract = await deploy.send({from: owner, gas});

	describe("ERPCoin Contract", () => {
		describe("constructor", () => {
			it("sets the owner address", async() => {
				assert.equal(await contract.methods.owner().call(), owner);
			});

			it("sets initial supply to zero", async() => {
				assert.equal(Number.parseInt(await contract.methods.totalSupply().call()), 0);
			});

			it("sets initial balances to zero", async() => {
				for(let account of accounts) {
					assert.equal(Number.parseInt(await contract.methods.balanceOf(account).call()), 0);
				}
			});

			it("sets initial allowances to zero", async() => {
				for(let account1 of accounts) {
					for(let account2 of accounts) {
						assert.equal(Number.parseInt(
							await contract.methods.allowance(account1, account2).call()), 0);
					}
				}
			});
		});

		describe("rewardCoins", () => {
			it("only works for the owner", async() => {
				assert.rejects(contract.methods.rewardCoins(user1, 10).send({from: user1}));
				await contract.methods.rewardCoins(user1, 10).send({from: owner});
			});

			it("updates the total supply", async() => {
				assert.equal(Number.parseInt(await contract.methods.totalSupply().call()), 10);
			});

			it("updates the current balance", async() => {
				assert.equal(Number.parseInt(await contract.methods.balanceOf(user1).call()), 10);
			});
		});

		describe("buyReward", () => {
			it("is limited by the current balance", async() => {
				assert.rejects(contract.methods.buyReward(0, 11).send({from: user1}));
				await contract.methods.buyReward(0, 2).send({from: user1});
			});

			it("updates the total supply", async() => {
				assert.equal(Number.parseInt(await contract.methods.totalSupply().call()), 8);
			});

			it("updates the current balance", async() => {
				assert.equal(Number.parseInt(await contract.methods.balanceOf(user1).call()), 8);
			});
		});

		describe("transfer", () => {
			it("is limited by the current balance", async() => {
				assert.rejects(contract.methods.transfer(user2, 9).send({from: user1}));
			});

			it("returns true", async() => {
				assert(await contract.methods.transfer(user2, 2).send({from: user1}));
			});

			it("does not change the total supply", async() => {
				assert.equal(Number.parseInt(await contract.methods.totalSupply().call()), 8);
			});

			it("updates the current balances", async() => {
				assert.equal(Number.parseInt(await contract.methods.balanceOf(user1).call()), 6);
				assert.equal(Number.parseInt(await contract.methods.balanceOf(user2).call()), 2);
			});
		});

		describe("approve", () => {
			it("returns true", async() => {
				assert(await contract.methods.approve(user2, 3).send({from: user1}));
			});

			it("updates the allowance", async() => {
				assert.equal(Number.parseInt(await contract.methods.allowance(user1, user2).call()), 3);
			});

			it("does not affect the reverse allowance", async() => {
				assert.equal(Number.parseInt(await contract.methods.allowance(user2, user1).call()), 0);
			});
		});

		describe("transferFrom", () => {
			it("is limited by the allowance", async() => {
				assert.rejects(contract.methods.transferFrom(user1, user2, 4).send({from: user2}));
			});

			it("returns true", async() => {
				assert(await contract.methods.transferFrom(user1, user2, 2).send({from: user2}));
			});

			it("does not change the total supply", async() => {
				assert.equal(Number.parseInt(await contract.methods.totalSupply().call()), 8);
			});

			it("updates the current balances", async() => {
				assert.equal(Number.parseInt(await contract.methods.balanceOf(user1).call()), 4);
				assert.equal(Number.parseInt(await contract.methods.balanceOf(user2).call()), 4);
			});

			it("decreases the allowance", async() => {
				assert.equal(Number.parseInt(await contract.methods.allowance(user1, user2).call()), 1);
			});

			it("is limited by the current balance", async() => {
				await contract.methods.buyReward(0, 4).send({from: user1});
				assert.rejects(contract.methods.transferFrom(user1, user2, 1).send({from: user2}));
			});
		});
	});
}

test();
