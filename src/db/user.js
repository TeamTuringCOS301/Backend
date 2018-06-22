module.exports = (query) => ({
	async verify(info) { // TODO: proper validation
		for(let key of ["username", "email", "password", "name", "surname", "walletAddress"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return true;
	},

	async add(info) {
		await query(`
			INSERT INTO tblUser (usrUsername, usrEmailAddress, usrPassword, usrName, usrSurname,
				usrWalletAddress, usrLastPointTime)
			VALUES (?, ?, ?, ?, ?, ?, 0)`,
			[info.username, info.email, info.password, info.name, info.surname,
				info.walletAddress]);
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
			SELECT usrUsername, usrEmailAddress, usrName, usrSurname, usrWalletAddress
			FROM tblUser
			WHERE usrID = ?`,
			[id]);
		return {
			username: results[0].usrUsername,
			email: results[0].usrEmailAddress,
			name: results[0].usrName,
			surname: results[0].usrSurname,
			walletAddress: results[0].usrWalletAddress
		};
	},

	async updateInfo(id, info) {
		const fields = {
			email: "usrEmailAddress",
			name: "usrName",
			surname: "usrSurname",
			walletAddress: "usrWalletAddress",
		};
		for(let key in fields) {
			if(typeof info[key] === "string") {
				await query(`
					UPDATE tblUser
					SET ${fields[key]} = ?
					WHERE usrID = ?`,
					[info[key], id]);
			}
		}
	},

	async getLatestTime(id){
		const result= await query(`
			SELECT usrLastPointTime
			FROM tblUser
			WHERE usrID=?`,
			[id]);
		return result[0].usrLastPointTime;
	}
});
