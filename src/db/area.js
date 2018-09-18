module.exports = (config, query) => ({
	async add(info) {
		await query(`
			INSERT INTO tblConservationArea (conName, conCity, conProvince, conBorderNodeJSONObject,
				conMiddlePointCoordinate)
			VALUES (?, ?, ?, ?, ?)`,
			[info.name, info.city, info.province, JSON.stringify(info.border),
				JSON.stringify(info.middle)]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblConservationArea
			WHERE conID = ?`,
			[id]);
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
				middle: JSON.parse(area.conMiddlePointCoordinate)
			});
		}
		return areas;
	},

	async validId(id) {
		const results = await query(`
			SELECT conID
			FROM tblConservationArea
			WHERE conID = ?`,
			[id]);
		return results.length === 1;
	},

	async getBorder(id) {
		const results = await query(`
			SELECT conBorderNodeJSONObject
			FROM tblConservationArea
			WHERE conID = ?`,
			[id]);
		return JSON.parse(results[0].conBorderNodeJSONObject);
	},

	async getInfo(id) {
		const results = await query(`
			SELECT conName, conCity, conProvince, conMiddlePointCoordinate, conBorderNodeJSONObject
			FROM tblConservationArea
			WHERE conID = ?`,
			[id]);
		return {
			name: results[0].conName,
			city: results[0].conCity,
			province: results[0].conProvince,
			middle: JSON.parse(results[0].conMiddlePointCoordinate),
			border: JSON.parse(results[0].conBorderNodeJSONObject)
		};
	},

	async updateInfo(id, info) {
		await query(`
			UPDATE tblConservationArea
			SET conName = ?, conCity = ?, conProvince = ?, conMiddlePointCoordinate = ?,
				conBorderNodeJSONObject = ?
			WHERE conID = ?`,
			[info.name, info.city, info.province, JSON.stringify(info.middle),
				JSON.stringify(info.border)]);
	},

	async getPrimaryAdmin(id) {
		const results = await query(`
			SELECT admID
			FROM tblAdminUser
			WHERE tblConservationArea_conID = ?`,
			[id]);
		if(results.length === 0) {
			return null;
		}
		// TODO: Add ability to set an admin other than the first as the primary admin.
		return results[0].admID;
	}
});
