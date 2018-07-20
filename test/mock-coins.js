module.exports = () => {
	const balances = {};

	return {
		async getBalance(address) {
			if(address in balances) {
				return balances[address];
			}
			return 0;
		},

		async getTotalEarned(address) {
			return await this.getBalance(address);
		},

		async rewardCoin(address) {
			balances[address] = await this.getBalance(address) + 1;
		}
	};
};
