const isBase64 = require("is-base64");

module.exports = (config, query) => ({
	async verify(info) { // TODO: proper validation
		for(let key of ["name", "description", "image"]) {
			if(typeof info[key] !== "string") {
				return false;
			}
		}
		for(let key of ["amount", "randValue"]) {
			if(typeof info[key] !== "number") {
				return false;
			}
		}
		return isBase64(info.image);
	},

	async add(info, admin) {
		await query(`
			INSERT INTO tblConservationAdminStock (casName, casDescription, casImage,
				casStockAmount, casRandValue, casCoinValue, casVerified, tblAdminUser_admID)
			VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
			[info.name, info.description, Buffer.from(info.image, "base64"), info.amount,
				info.randValue, admin]);
	},

	async remove(id) {
		await query(`
			DELETE FROM tblConservationAdminStock
			WHERE casID = ?`,
			[id]);
	},

	async find(id) {
		const results = await query(`
			SELECT casID
			FROM tblConservationAdminStock
			WHERE casID = ?`,
			[id]);
		if(results.length) {
			return results[0].casID;
		} else {
			return null;
		}
	},

	async getAdmin(id) {
		const results = await query(`
			SELECT tblAdminUser_admID
			FROM tblConservationAdminStock
			WHERE casID = ?`,
			[id]);
		return results[0].tblAdminUser_admID;
	},

	async list() {
		const results = await query(`
			SELECT casID, casName, casDescription, casImage, casStockAmount, casRandValue,
				casCoinValue
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
				coinValue: reward.casCoinValue
			});
		}
		return rewards;
	},

	async listOwned(admin) {
		const results = await query(`
			SELECT casID, casName, casDescription, casImage, casStockAmount, casRandValue,
				casCoinValue, casVerified
			FROM tblConservationAdminStock
			WHERE tblAdminUser_admID = ?`,
			[admin]);
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

	async listNew() {
		const results = await query(`
			SELECT casID, casName, casDescription, casImage, casStockAmount, casRandValue
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
				randValue: reward.casRandValue
			});
		}
		return rewards;
	},

	async verifyCoinValue(id, coinValue) {
		await query(`
			UPDATE tblConservationAdminStock
			SET casCoinValue = ?, casVerified = 1
			WHERE casID = ?`,
			[coinValue, id]);
	}
});
