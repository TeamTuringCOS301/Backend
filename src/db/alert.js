module.exports = (config, query) => ({
	async add(info) {
		if(info.image) {
			await query(`
				INSERT INTO tblAlert (aleTimeSent, aleHeader, aleDescription, aleSeverity, aleImage,
					aleBroadcast, aleLocation, tblConservationArea_conID, tblUser_usrID)
				VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
				[info.time, info.title, info.description, info.severity,
					Buffer.from(info.image, "base64"), JSON.stringify(info.location), info.area,
					info.user]);
		} else {
			await query(`
				INSERT INTO tblAlert (aleTimeSent, aleHeader, aleDescription, aleSeverity,
					aleBroadcast, aleLocation, tblConservationArea_conID, tblUser_usrID)
				VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
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
			SELECT aleID, aleTimeSent, aleHeader, aleDescription, aleSeverity,
				aleImage IS NOT NULL AS hasImage, aleBroadcast, aleLocation
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
				hasImage: alert.hasImage,
				broadcast: alert.aleBroadcast[0] === 1,
				location: JSON.parse(alert.aleLocation)
			});
		}
		return alerts;
	},

	async listBroadcasts(area, since) {
		const results = await query(`
			SELECT aleID, aleTimeSent, aleHeader, aleDescription, aleSeverity,
				aleImage IS NOT NULL AS hasImage, aleLocation
			FROM tblAlert
			WHERE aleBroadcast = 1 AND tblConservationArea_conID = ? AND aleTimeSent > ?`,
			[area, since]);
		const alerts = [];
		for(let alert of results) {
			alerts.push({
				id: alert.aleID,
				time: alert.aleTimeSent,
				title: alert.aleHeader,
				description: alert.aleDescription,
				severity: alert.aleSeverity,
				hasImage: alert.hasImage,
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

	async getImage(id) {
		const results = await query(`
			SELECT aleImage
			FROM tblAlert
			WHERE aleID = ?`,
			[id]);
		return results[0].aleImage;
	},

	async getArea(id) {
		const results = await query(`
			SELECT tblConservationArea_conID
			FROM tblAlert
			WHERE aleID = ?`,
			[id]);
		return results[0].tblConservationArea_conID;
	},

	async updateInfo(id, info) {
		await query(`
			UPDATE tblAlert
			SET aleHeader = ?, aleDescription = ?, aleSeverity = ?, aleBroadcast = ?,
				aleLocation = ?
			WHERE aleID = ?`,
			[info.title, info.description, info.severity, info.broadcast,
				JSON.stringify(info.location), id]);
		if(info.image) {
			await query(`
				UPDATE tblAlert
				SET aleImage = ?
				WHERE aleID = ?`,
				[Buffer.from(info.image, "base64"), id]);
		}
	}
});
