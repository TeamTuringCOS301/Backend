module.exports = (config, query) => ({
	async add(info) {
		await query(`
			INSERT INTO tblConservationAdminStock (casName, casDescription, casImage,
				casStockAmount, casRandValue, casCoinValue, casVerified, tblConservationArea_conID)
			VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
			[info.name, info.description, Buffer.from(info.image, "base64"), info.amount,
				info.randValue, info.area]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblConservationAdminStock
			WHERE casID = ?`,
			[id]);
	},

	async list() {
		const results = await query(`
			SELECT casID, casName, casDescription, casImage, casStockAmount, casRandValue,
				casCoinValue, tblConservationArea_conID
			FROM tblConservationAdminStock
			WHERE casVerified = 1`);
		const rewards = [];
		for(let reward of results) {
			rewards.push({
				id: reward.casID,
				name: reward.casName,
				description: reward.casDescription,
				image: reward.casImage.toString("base64"),
				amount: reward.casStockAmount,
				randValue: reward.casRandValue,
				coinValue: reward.casCoinValue,
				area: reward.tblConservationArea_conID
			});
		}
		return rewards;
	},

	async listNew() {
		const results = await query(`
			SELECT casID, casName, casDescription, casImage, casStockAmount, casRandValue,
				tblConservationArea_conID
			FROM tblConservationAdminStock
			WHERE casVerified = 0`);
		const rewards = [];
		for(let reward of results) {
			rewards.push({
				id: reward.casID,
				name: reward.casName,
				description: reward.casDescription,
				image: reward.casImage.toString("base64"),
				amount: reward.casStockAmount,
				randValue: reward.casRandValue,
				area: reward.tblConservationArea_conID
			});
		}
		return rewards;
	},

	async listOwned(area) {
		const results = await query(`
			SELECT casID, casName, casDescription, casImage, casStockAmount, casRandValue,
				casCoinValue, casVerified
			FROM tblConservationAdminStock
			WHERE tblConservationArea_conID = ?`,
			[area]);
		const rewards = [];
		for(let reward of results) {
			rewards.push({
				id: reward.casID,
				name: reward.casName,
				description: reward.casDescription,
				image: reward.casImage.toString("base64"),
				amount: reward.casStockAmount,
				randValue: reward.casRandValue,
				coinValue: reward.casCoinValue,
				verified: reward.casVerified[0] === 1
			});
		}
		return rewards;
	},

	async validId(id) {
		const results = await query(`
			SELECT casID
			FROM tblConservationAdminStock
			WHERE casID = ?`,
			[id]);
		return results.length === 1;
	},

	async getArea(id) {
		const results = await query(`
			SELECT tblConservationArea_conID
			FROM tblConservationAdminStock
			WHERE casID = ?`,
			[id]);
		return results[0].tblConservationArea_conID;
	},

	async verifyCoinValue(id, coinValue) {
		await query(`
			UPDATE tblConservationAdminStock
			SET casCoinValue = ?, casVerified = 1
			WHERE casID = ?`,
			[coinValue, id]);
	}
});
