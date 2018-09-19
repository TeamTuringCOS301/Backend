module.exports = () => {
	const balances = {};
	let purchase = {user: -1, reward: -1};

	return {
		async getContractJson() {
			return {abi: [], address: "0x0"};
		},

		async getBalance(address) {
			if(address in balances) {
				return balances[address];
			}
			return 0;
		},

		async rewardCoins(address, coins) {
			balances[address] = await this.getBalance(address) + coins;
		},

		async rewardPurchaseDone(user, reward) {
			purchase = {user: user.id, reward: reward.id};
		},

		testLatestReward() {
			return purchase;
		}
	};
};
