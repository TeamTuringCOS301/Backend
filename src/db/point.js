module.exports = (query) => ({
	async add(point, area, userId, time){
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
			SELECT a
			FROM (
				SELECT SIN(RADIANS(cupLocationLatitude - ?) / 2)
						* SIN(RADIANS(cupLocationLatitude - ?) / 2)
					+ COS(RADIANS(cupLocationLatitude)) * COS(RADIANS(?))
						* SIN(RADIANS(cupLocationLongitude - ?) / 2)
						* SIN(RADIANS(cupLocationLongitude - ?) / 2) AS a
				FROM tblConservationAreaUserPoints
				WHERE tblConservationArea_conID = ?) AS alias
			WHERE 6371 * ATAN2(SQRT(alias.a), SQRT(1 - alias.a)) < ?`,
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
	},

	async list(id){
		const results = await query(`
			SELECT cupDateTime,cupLocationLatitude,cupLocationLongitude
			FROM tblConservationAreaUserPoints
			WHERE tblConservationArea_conID = ?`,
			[id]);

		const points=[];
		for(let point of results){
			points.push({
				time: point.cupDateTime,
				lat: point.cupLocationLatitude,
				lng: point.cupLocationLongitude
			});
		}
		return points;
	},

	async listSince(id,since){
		const results = await query(`
			SELECT cupDateTime,cupLocationLatitude,cupLocationLongitude
			FROM tblConservationAreaUserPoints
			WHERE tblConservationArea_conID = ? AND cupDateTime < ?`,
			[id,since]);

		const points=[];
		for(let point of results){
			points.push({
				time: point.cupDateTime,
				lat: point.cupLocationLatitude,
				lng: point.cupLocationLongitude
			});
		}
		return points;
	}
});
