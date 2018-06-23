module.exports = (config, query) => ({
	async add(info) {
		await query(`
			INSERT INTO tblConservationAreaUserPoints (cupDateTime, cupLocationLatitude,
				cupLocationLongitude, tblConservationArea_conID)
			VALUES (?, ?, ?, ?)`,
			[info.time, info.lat, info.lng, info.area]);
		await query(`
			UPDATE tblUser
			SET usrLastPointTime = ?
			WHERE usrID = ?`,
			[info.time, info.user]);
	},

	async list(id, since) {
		const results = await query(`
			SELECT cupDateTime, cupLocationLatitude, cupLocationLongitude
			FROM tblConservationAreaUserPoints
			WHERE tblConservationArea_conID = ? AND cupDateTime > ?`,
			[id, since]);
		const points = [];
		for(let point of results){
			points.push({
				time: point.cupDateTime,
				lat: point.cupLocationLatitude,
				lng: point.cupLocationLongitude
			});
		}
		return points;
	},

	async countNearbyPoints(info) {
		const results = await query(`
			SELECT a
			FROM (
				SELECT SIN(RADIANS(cupLocationLatitude - ?) / 2)
						* SIN(RADIANS(cupLocationLatitude - ?) / 2)
					+ COS(RADIANS(cupLocationLatitude)) * COS(RADIANS(?))
						* SIN(RADIANS(cupLocationLongitude - ?) / 2)
						* SIN(RADIANS(cupLocationLongitude - ?) / 2) AS a
				FROM tblConservationAreaUserPoints
				WHERE tblConservationArea_conID = ?) AS alias
			WHERE 6371000 * ATAN2(SQRT(alias.a), SQRT(1 - alias.a)) < ?`,
			[info.lat, info.lat, info.lat, info.lng, info.lng, info.area,
				config.coinRewards.nearRadius]);
		return results.length;
	},

	async limitPoints(area) {
		const results = await query(`
			SELECT cupID
			FROM tblConservationAreaUserPoints
			WHERE tblConservationArea_conID = ?`);
		if(results.length > config.coinRewards.pointsPerArea) {
			await query(`
				DELETE FROM tblConservationAreaUserPoints
				WHERE cupID IN (
					SELECT TOP ? cupID
					FROM tblConservationAreaUserPoints
					WHERE tblConservationArea_conID = ?
					ORDER BY cupDateTime)`,
				[results.length - config.coinRewards.pointsPerArea, area]);
		}
	}
});
