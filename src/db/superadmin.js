module.exports = (config, query) => ({
	async add(info) {
		await query(`
			INSERT INTO tblSuperAdminUser (sadUsername, sadEmailAddress, sadPassword, sadName,
				sadSurname)
			VALUES (?, ?, ?, ?, ?)`,
			[info.username, info.email, info.password, info.name, info.surname]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblSuperAdminUser
			WHERE sadID = ?`,
			[id]);
	},

	async list() {
		const results = await query(`
			SELECT sadID, sadUsername, sadEmailAddress, sadName, sadSurname
			FROM tblSuperAdminUser`);
		const admins = [];
		for(let admin of results) {
			admins.push({
				id: admin.sadID,
				username: admin.sadUsername,
				email: admin.sadEmailAddress,
				name: admin.sadName,
				surname: admin.sadSurname
			});
		}
		return admins;
	},

	async validId(id) {
		const results = await query(`
			SELECT sadID
			FROM tblSuperAdminUser
			WHERE sadID = ?`,
			[id]);
		return results.length === 1;
	},

	async find(username) {
		const results = await query(`
			SELECT sadID
			FROM tblSuperAdminUser
			WHERE sadUsername = ?`,
			[username]);
		if(results.length) {
			return results[0].sadID;
		} else {
			return null;
		}
	},

	async getPassword(id) {
		const results = await query(`
			SELECT sadPassword
			FROM tblSuperAdminUser
			WHERE sadID = ?`,
			[id]);
		return results[0].sadPassword;
	},

	async setPassword(id, password) {
		await query(`
			UPDATE tblSuperAdminUser
			SET sadPassword = ?
			WHERE sadID = ?`,
			[password, id]);
	},

	async getInfo(id) {
		const results = await query(`
			SELECT sadUsername, sadEmailAddress, sadName, sadSurname
			FROM tblSuperAdminUser
			WHERE sadID = ?`,
			[id]);
		return {
			username: results[0].sadUsername,
			email: results[0].sadEmailAddress,
			name: results[0].sadName,
			surname: results[0].sadSurname
		};
	},

	async updateInfo(id, info) {
		await query(`
			UPDATE tblSuperAdminUser
			SET sadEmailAddress = ?, sadName = ?, sadSurname = ?
			WHERE sadID = ?`,
			[info.email, info.name, info.surname, id]);
	}
});
