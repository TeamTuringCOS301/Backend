module.exports = (config, query) => ({
	async add(info) {
		await query(`
			INSERT INTO tblAdminUser (admUsername, admEmailAddress, admPassword, admName,
				admSurname, tblConservationArea_conID)
			VALUES (?, ?, ?, ?, ?, ?)`,
			[info.username, info.email, info.password, info.name, info.surname, info.area]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
	},

	async list() {
		const results = await query(`
			SELECT admID, admUsername, admEmailAddress, admName, admSurname,
				tblConservationArea_conID
			FROM tblAdminUser`);
		const admins = [];
		for(let admin of results) {
			admins.push({
				id: admin.admID,
				username: admin.admUsername,
				email: admin.admEmailAddress,
				name: admin.admName,
				surname: admin.admSurname,
				area: admin.tblConservationArea_conID
			});
		}
		return admins;
	},

	async validId(id) {
		const results = await query(`
			SELECT admID
			FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
		return results.length === 1;
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
			SELECT admUsername, admEmailAddress, admName, admSurname, tblConservationArea_conID
			FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
		return {
			username: results[0].admUsername,
			email: results[0].admEmailAddress,
			name: results[0].admName,
			surname: results[0].admSurname,
			area: results[0].tblConservationArea_conID
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
	},

	async getArea(id) {
		const results = await query(`
			SELECT tblConservationArea_conID
			FROM tblAdminUser
			WHERE admID = ?`,
			[id]);
		return results[0].tblConservationArea_conID;
	}
});
