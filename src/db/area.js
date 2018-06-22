module.exports = (query) => ({
	async verify(info) { // TODO: proper validation
		for(let key of ["name", "city", "province"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		return true;
	},

	async add(info) {
		await query(`
			INSERT INTO tblConservationArea (conName, conCity, conProvince, conBorderNodeJSONObject,
				conMiddlePointCoordinate, tblAdminUser_admID)
			VALUES (?, ?, ?, ?, ?, ?)`,
			[info.name, info.city, info.province, info.border, info.middle, info.admin]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblConservationArea
			WHERE conID = ?`,
			[id]);
	},

	async find(id) {
		const results = await query(`
			SELECT conID
			FROM tblConservationArea
			WHERE conID = ?`,
			[id]);
		if(results.length) {
			return results[0].conID;
		} else {
			return null;
		}
	},

	async getAdmin(id) {
		const results = await query(`
			SELECT tblAdminUser_admID
			FROM tblConservationArea
			WHERE conID = ?`,
			[id]);
		return results[0].tblAdminUser_admID;
	},

	async list() {
		const results = await query(`
			SELECT conID, conName, conCity, conProvince, conMiddlePointCoordinate
			FROM tblConservationArea`);
		const areas = [];
		for(let area of results) {
			areas.push({
				id: area.conID,
				name: area.conName,
				city: area.conCity,
				province: area.conProvince,
				middle: area.conMiddlePointCoordinate
			});
		}
		return areas;
	},

	async getInfo(id) {
		const results = await query(`
			SELECT conName, conCity, conProvince, conMiddlePointCoordinate, conBorderNodeJSONObject
			FROM tblConservationArea WHERE conID = ?`,
			[id]);
		return {
			name: results[0].conName,
			city: results[0].conCity,
			province: results[0].conProvince,
			middle: results[0].conMiddlePointCoordinate,
			border: results[0].conBorderNodeJSONObject
		};
	},

	async updateInfo(id, info) {
		const fields = {
			name: "conName",
			city: "conCity",
			province: "conProvince",
			middle: "conMiddlePointCoordinate",
			border: "conBorderNodeJSONObject"
		};
		for(let key in fields) {
			if(typeof info[key] === "string") {
				await query(`
					UPDATE tblConservationArea
					SET ${fields[key]} = ?
					WHERE conID = ?`,
					[info[key], id]);
			}
		}
		if(typeof info.admin === number) {
			await query(`
				UPDATE tblConservationArea
				SET tblAdminUser_admID = ?
				WHERE conID = ?`,
				[info.admin, id]);
		}
	}
});
