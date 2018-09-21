const assert = require("assert");
const ERPCoin = artifacts.require("./ERPCoin.sol");

contract("ERPCoin", (accounts) => {
	const owner = accounts[0];
	const user1 = accounts[1];
	const user2 = accounts[2];

	describe("constructor", () => {
		it("sets the owner address", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal(await contract.owner(), owner);
		});

		it("sets initial supply to zero", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.totalSupply()).toNumber(), 0);
		});

		it("sets initial balances to zero", async() => {
			const contract = await ERPCoin.deployed();
			for(let account of accounts) {
				assert.equal((await contract.balanceOf(account)).toNumber(), 0);
			}
		});

		it("sets initial allowances to zero", async() => {
			const contract = await ERPCoin.deployed();
			for(let account1 of accounts) {
				for(let account2 of accounts) {
					assert.equal((await contract.allowance(account1, account2)).toNumber(), 0);
				}
			}
		});
	});

	describe("rewardCoins", () => {
		it("only works for the owner", async() => {
			const contract = await ERPCoin.deployed();
			assert.rejects(contract.rewardCoins(user1, 10, {from: user1}));
			await contract.rewardCoins(user1, 10, {from: owner});
		});

		it("updates the total supply", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.totalSupply()).toNumber(), 10);
		});

		it("updates the current balance", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.balanceOf(user1)).toNumber(), 10);
		});
	});

	describe("buyReward", () => {
		it("is limited by the current balance", async() => {
			const contract = await ERPCoin.deployed();
			assert.rejects(contract.buyReward(0, 11, {from: user1}));
			await contract.buyReward(0, 2, {from: user1});
		});

		it("updates the total supply", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.totalSupply()).toNumber(), 8);
		});

		it("updates the current balance", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.balanceOf(user1)).toNumber(), 8);
		});
	});

	describe("transfer", () => {
		it("is limited by the current balance", async() => {
			const contract = await ERPCoin.deployed();
			assert.rejects(contract.transfer(user2, 9, {from: user1}));
		});

		it("returns true", async() => {
			const contract = await ERPCoin.deployed();
			assert(await contract.transfer(user2, 2, {from: user1}));
		});

		it("does not change the total supply", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.totalSupply()).toNumber(), 8);
		});

		it("updates the current balances", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.balanceOf(user1)).toNumber(), 6);
			assert.equal((await contract.balanceOf(user2)).toNumber(), 2);
		});
	});

	describe("approve", () => {
		it("returns true", async() => {
			const contract = await ERPCoin.deployed();
			assert(await contract.approve(user2, 3, {from: user1}));
		});

		it("updates the allowance", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.allowance(user1, user2)).toNumber(), 3);
		});

		it("does not affect the reverse allowance", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.allowance(user2, user1)).toNumber(), 0);
		});
	});

	describe("transferFrom", () => {
		it("is limited by the allowance", async() => {
			const contract = await ERPCoin.deployed();
			assert.rejects(contract.transferFrom(user1, user2, 4, {from: user2}));
		});

		it("returns true", async() => {
			const contract = await ERPCoin.deployed();
			assert(await contract.transferFrom(user1, user2, 2, {from: user2}));
		});

		it("does not change the total supply", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.totalSupply()).toNumber(), 8);
		});

		it("updates the current balances", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.balanceOf(user1)).toNumber(), 4);
			assert.equal((await contract.balanceOf(user2)).toNumber(), 4);
		});

		it("decreases the allowance", async() => {
			const contract = await ERPCoin.deployed();
			assert.equal((await contract.allowance(user1, user2)).toNumber(), 1);
		});

		it("is limited by the current balance", async() => {
			const contract = await ERPCoin.deployed();
			await contract.buyReward(0, 4, {from: user1});
			assert.rejects(contract.transferFrom(user1, user2, 1, {from: user2}));
		});
	});
});
