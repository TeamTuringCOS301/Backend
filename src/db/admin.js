module.exports = (query) => ({
	async verify(info) { // TODO: proper validation
		for(let key of ["username", "email", "name", "surname"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return true;
	},

	async add(info) {
		await query(`
			INSERT INTO tblAdminUser (admUsername, admEmailAddress, admPassword, admName,
				admSurname, admSuperAdmin)
			VALUES (?, ?, ?, ?, ?, 0)`,
			[info.username, info.email, info.password, info.name, info.surname]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
	},

	async list() {
		const results = await query(`
			SELECT admUsername, admEmailAddress, admName, admSurname
			FROM tblAdminUser
			WHERE admSuperAdmin = 0`);
		const admins = [];
		for(let admin of results) {
			admins.push({
				username: admin.admUsername,
				email: admin.admEmailAddress,
				name: admin.admName,
				surname: admin.admSurname,
			});
		}
		return admins;
	},

	async find(username) {
		const results = await query(`
			SELECT admID
			FROM tblAdminUser
			WHERE admUsername = ?`,
			[username]);
		if(results.length) {
			return results[0].admID;
		} else {
			return null;
		}
	},

	async isSuperAdmin(id) {
		const results = await query(`
			SELECT admSuperAdmin
			FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
		return results[0].admSuperAdmin[0] === 1;
	},

	async getPassword(id) {
		const results = await query(`
			SELECT admPassword
			FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
		return results[0].admPassword;
	},

	async setPassword(id, password) {
		await query(`
			UPDATE tblAdminUser
			SET admPassword = ?
			WHERE admID = ?`,
			[password, id]);
	},

	async getInfo(id) {
		const results = await query(`
			SELECT admUsername, admEmailAddress, admName, admSurname
			FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
		return {
			username: results[0].admUsername,
			email: results[0].admEmailAddress,
			name: results[0].admName,
			surname: results[0].admSurname,
		};
	},

	async updateInfo(id, info) {
		const fields = {
			email: "admEmailAddress",
			name: "admName",
			surname: "admSurname",
		};
		for(let key in fields) {
			if(typeof info[key] === "string") {
				await query(`
					UPDATE tblAdminUser
					SET ${fields[key]} = ?
					WHERE admID = ?`,
					[info[key], id]);
			}
		}
	}
});
