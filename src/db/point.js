module.exports = (query) => ({
	async add(point, area, user, time){
		await query(`
			UPDATE tblUser
			SET usrLastPointTime = ?
			WHERE usrID = ?`,
			[time, userId]);
		await query(`
			INSERT INTO tblConservationAreaUserPoints (cupDateTime, cupLocationLatitude,
				cupLocationLongitude, tblConservationArea_conID)
			VALUES (?, ?, ?, ?)`,
			[time, point.lat, point.lng, area]);
	},

	async countNearbyPoints(point, id) {
		const limit = 0.1; // TODO: Update limit.
		const results = await query(`
			SELECT a = SIN(RADIANS(cupLocationLatitude - ?) / 2)
					* SIN(RADIANS(cupLocationLatitude - ?) / 2)
				+ COS(RADIANS(cupLocationLatitude)) * COS(RADIANS(?))
					* SIN(RADIANS(cupLocationLongitude - ?) / 2)
					* SIN(RADIANS(cupLocationLongitude - ?) / 2)
			WHERE tblConservationArea_conID = ? AND 6371 * ATAN2(SQRT(a), SQRT(1 - a)) < ?`
			[point.lat, point.lat, point.lat, point.lng, point.lng, id, limit]);
		return results.length;
	},

	async limitPoints(area) {
		const results = await query(`
			SELECT cupID
			FROM tblConservationAreaUserPoints
			WHERE tblConservationArea_conID = ?`);
		const limit = 100; // TODO: Update limit.
		if(results.length > limit) {
			await query(`
				DELETE FROM tblConservationAreaUserPoints
				WHERE cupID IN (
					SELECT TOP ? cupID
					FROM tblConservationAreaUserPoints
					ORDER BY cupDateTime)`,
				[results.length - limit]);
		}
	}
});
