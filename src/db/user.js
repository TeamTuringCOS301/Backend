module.exports = (config, query) => ({
	async add(info) {
		await query(`
			INSERT INTO tblUser (usrUsername, usrEmailAddress, usrPassword, usrName, usrSurname,
				usrUnclaimedBalance, usrTotalCoinsEarned, usrLastPointTime)
			VALUES (?, ?, ?, ?, ?, 0, 0, 0)`,
			[info.username, info.email, info.password, info.name, info.surname]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblUser
			WHERE usrID = ?`,
			[id]);
	},

	async validId(id) {
		const results = await query(`
			SELECT usrID
			FROM tblUser
			WHERE usrID = ?`,
			[id]);
		return results.length === 1;
	},

	async find(username) {
		const results = await query(`
			SELECT usrID
			FROM tblUser
			WHERE usrUsername = ?`,
			[username]);
		if(results.length) {
			return results[0].usrID;
		} else {
			return null;
		}
	},

	async findByAddress(address) {
		const results = await query(`
			SELECT usrID
			FROM tblUser
			WHERE usrWalletAddress = ?`,
			[address]);
		if(results.length) {
			return results[0].usrID;
		} else {
			return null;
		}
	},

	async getPassword(id) {
		const results = await query(`
			SELECT usrPassword
			FROM tblUser
			WHERE usrID = ?`,
			[id]);
		return results[0].usrPassword;
	},

	async setPassword(id, password) {
		await query(`
			UPDATE tblUser
			SET usrPassword = ?
			WHERE usrID = ?`,
			[password, id]);
	},

	async getInfo(id) {
		const results = await query(`
			SELECT usrUsername, usrEmailAddress, usrName, usrSurname, usrWalletAddress,
				usrUnclaimedBalance, usrTotalCoinsEarned
			FROM tblUser
			WHERE usrID = ?`,
			[id]);
		return {
			username: results[0].usrUsername,
			email: results[0].usrEmailAddress,
			name: results[0].usrName,
			surname: results[0].usrSurname,
			walletAddress: results[0].usrWalletAddress,
			coinBalance: results[0].usrUnclaimedBalance,
			coinsEarned: results[0].usrTotalCoinsEarned
		};
	},

	async updateInfo(id, info) {
		await query(`
			UPDATE tblUser
			SET usrEmailAddress = ?, usrName = ?, usrSurname = ?
			WHERE usrID = ?`,
			[info.email, info.name, info.surname, id]);
	},

	async clearWalletAddress(id) {
		await query(`
			UPDATE tblUser
			SET usrWalletAddress = NULL
			WHERE usrID = ?`,
			[id]);
	},

	async setWalletAddress(id, address) {
		await query(`
			UPDATE tblUser
			SET usrWalletAddress = ?, usrUnclaimedBalance = 0
			WHERE usrID = ?`,
			[address, id]);
	},

	async getWalletAddress(id) {
		const results = await query(`
			SELECT usrWalletAddress
			FROM tblUser
			WHERE usrID = ?`,
			[id]);
		return results[0].usrWalletAddress;
	},

	async getUnclaimedBalance(id) {
		const results = await query(`
			SELECT usrUnclaimedBalance
			FROM tblUser
			WHERE usrID = ?`,
			[id]);
		return results[0].usrUnclaimedBalance;
	},

	async rewardCoin(id) {
		await query(`
			UPDATE tblUser
			SET usrUnclaimedBalance = usrUnclaimedBalance + 1
			WHERE usrID = ?`,
			[id]);
	},

	async getLatestTime(id) {
		const results = await query(`
			SELECT usrLastPointTime
			FROM tblUser
			WHERE usrID = ?`,
			[id]);
		return results[0].usrLastPointTime;
	}
});
