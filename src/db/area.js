module.exports = (config, query) => ({
	async add(info) {
		await query(`
			INSERT INTO tblConservationArea (conName, conCity, conProvince, conBorderNodeJSONObject,
				conMiddlePointCoordinate)
			VALUES (?, ?, ?, ?, ?)`,
			[info.name, info.city, info.province, info.border, info.middle]);
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
				middle: area.conMiddlePointCoordinate
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
	}
});
