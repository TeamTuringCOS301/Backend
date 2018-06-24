module.exports = (config, query) => ({
	async add(info) {
		if(info.image) {//TODO: Change default for broadcast to 0
			await query(`
				INSERT INTO tblAlert (aleTimeSent, aleHeader, aleDescription, aleSeverity, aleImage,
					aleBroadcast, aleLocation, tblConservationArea_conID, tblUser_usrID)
				VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
				[info.time, info.title, info.description, info.severity,
					Buffer.from(info.image, "base64"), JSON.stringify(info.location), info.area,
					info.user]);
		} else {
			await query(`
				INSERT INTO tblAlert (aleTimeSent, aleHeader, aleDescription, aleSeverity, aleImage,
					aleBroadcast, aleLocation, tblConservationArea_conID, tblUser_usrID)
				VALUES (?, ?, ?, ?, 0, 1, ?, ?, ?)`,
				[info.time, info.title, info.description, info.severity,
					JSON.stringify(info.location), info.area, info.user]);
		}
	},

	async remove(id) {
		await query(`
			DELETE FROM tblAlert
			WHERE aleID = ?`,
			[id]);
	},

	async list(area, since) {
		const results = await query(`
			SELECT aleID, aleTimeSent, aleHeader, aleDescription, aleSeverity, aleImage,
				aleBroadcast, aleLocation
			FROM tblAlert
			WHERE tblConservationArea_conID = ? AND aleTimeSent > ?`,
			[area, since]);
		const alerts = [];
		for(let alert of results) {
			alerts.push({
				id: alert.aleID,
				time: alert.aleTimeSent,
				title: alert.aleHeader,
				description: alert.aleDescription,
				severity: alert.aleSeverity,
				image: alert.aleImage.toString("base64"),
				broadcast: alert.aleBroadcast[0] === 1,
				location: JSON.parse(alert.aleLocation)
			});
		}
		return alerts;
	},

	async listBroadcasts(area, since) {
		const results = await query(`
			SELECT aleTimeSent, aleHeader, aleDescription, aleSeverity, aleImage, aleLocation
			FROM tblAlert
			WHERE aleBroadcast = 1 AND tblConservationArea_conID = ? AND aleTimeSent > ?`,
			[area, since]);
		const alerts = [];
		for(let alert of results) {
			alerts.push({
				time: alert.aleTimeSent,
				title: alert.aleHeader,
				description: alert.aleDescription,
				severity: alert.aleSeverity,
				image: alert.aleImage.toString("base64"),
				location: JSON.parse(alert.aleLocation)
			});
		}
		return alerts;
	},

	async validId(id) {
		const results = await query(`
			SELECT aleID
			FROM tblAlert
			WHERE aleID = ?`,
			[id]);
		return results.length === 1;
	},

	async getArea(id) {
		const results = await query(`
			SELECT tblConservationArea_conID
			FROM tblAlert
			WHERE aleID = ?`,
			[id]);
		return results[0].tblConservationArea_conID;
	},

	async setBroadcast(id, broadcast) {
		await query(`
			UPDATE tblAlert
			SET aleBroadcast = ?
			WHERE aleID = ?`,
			[broadcast, id]);
	}
});
