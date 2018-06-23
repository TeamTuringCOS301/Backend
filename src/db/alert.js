const isBase64 = require("is-base64");

module.exports = (config, query) => ({
	async verify(info) { // TODO: proper validation
		for(let key of ["title", "description"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		for(let key of ["lat", "lng"]) {
			if(!("location" in info) || typeof info.location[key] !== "number") {
				return false;
			}
		}
		return [0, 1, 2].includes(info.severity) && (!info.image || isBase64(info.image));
	},

	async add(info, area, user) {
		if(info.image) {
			await query(`
				INSERT INTO tblAlert (aleHeader, aleDescription, aleSeverity, aleImage,
					aleBroadcast, aleLocation, tblConservationArea_conID, tblUser_usrID)
				VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
				[info.title, info.description, info.severity, Buffer.from(info.image, "base64"),
					JSON.stringify(ale.location), area, user]);
		} else {
			await query(`
				INSERT INTO tblAlert (aleHeader, aleDescription, aleSeverity, aleBroadcast,
					aleLocation, tblUser_usrID)
				VALUES (?, ?, ?, 0, ?, ?, ?)`,
				[info.title, info.description, info.severity, JSON.stringify(info.location), area,
					user]);
		}
	},

	async remove(id) {
		await query(`
			DELETE FROM tblAlert
			WHERE aleID = ?`,
			[id]);
	},

	async list(area) {
		const results = await query(`
			SELECT aleHeader, aleDescription, aleSeverity, aleImage, aleLocation
			FROM tblAlert
			WHERE casBroadcast = 1 AND tblConservationArea_conID = ?`,
			[area]);
		const alerts = [];
		for(let alert of results) {
			alerts.push({
				title: alert.aleHeader,
				description: alert.aleDescription,
				severity: alert.aleSeverity,
				image: alert.aleImage.toString("base64"),
				location: JSON.parse(alert.aleLocation)
			});
		}
		return rewards;
	},

	async listAll(area) {
		const results = await query(`
			SELECT aleID, aleHeader, aleDescription, aleSeverity, aleImage, aleBroadcast,
				aleLocation
			FROM tblAlert
			WHERE tblConservationArea_conID = ?`,
			[area]);
		const alerts = [];
		for(let alert of results) {
			alerts.push({
				id: alert.aleID,
				title: alert.aleHeader,
				description: alert.aleDescription,
				severity: alert.aleSeverity,
				image: alert.aleImage.toString("base64"),
				broadcast: alert.aleBroadcast[0] === 1,
				location: JSON.parse(alert.aleLocation)
			});
		}
		return rewards;
	},

	async getArea(id) {
		const results = await query(`
			SELECT tblConservationArea_conID
			FROM tblAlert
			WHERE aleID = ?`,
			[id]);
		if(results.length) {
			return results[0].tblConservationArea_conID;
		} else {
			return null;
		}
	},

	async setBroadcast(id, broadcast) {
		await query(`
			UPDATE tblAlert
			SET aleBroadcast = ?
			WHERE aleID = ?`,
			[broadcast, id]);
	}
});
