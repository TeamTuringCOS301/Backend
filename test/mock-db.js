const session = require("express-session");

module.exports = () => {
	const admins = [];
	const alerts = [];
	const areas = [];
	const points = [];
	const rewards = [];
	const superadmins = [{
		username: "admin",
		email: "admin@erp.coin",
		password: "$2b$10$Je4jhW7cPYREOxsIqmzKXu/ug3eJNOeVv/sOS1AjJ0ljeb99EelNS",
		name: "John",
		surname: "Smith"
	}];
	const users = [];

	return {
		sessionStore: new session.MemoryStore(),
		secureCookies: false,

		admin: {
			async add(info) {
				admins.push(info);
			},

			async remove(id) {
				admins[id] = undefined;
			},

			async list() {
				return admins.filter((admin) => admin !== undefined).map((admin) => {
					const result = {};
					for(let key in admin) {
						if(key !== "password") {
							result[key] = admin[key];
						}
					}
					return result;
				});
			},

			async validId(id) {
				return admins[id] !== undefined;
			},

			async find(username) {
				const index = admins.findIndex((admin) => admin !== undefined
					&& admin.username === username);
				return index >= 0 ? index : null;
			},

			async getPassword(id) {
				return admins[id].password;
			},

			async setPassword(id, password) {
				admins[id].password = password;
			},

			async getInfo(id) {
				const admin = {};
				for(let key in admins[id]) {
					if(key !== "password") {
						admin[key] = admins[id][key];
					}
				}
				return admin;
			},

			async updateInfo(id, info) {
				info.username = admins[id].username;
				info.password = admins[id].password;
				info.area = admins[id].area;
				admins[id] = info;
			},

			async getArea(id) {
				return admins[id].area;
			}
		},

		alert: {
			async add(info) {
				info.broadcast = false;
				alerts.push(info);
			},

			async remove(id) {
				alerts[id] = undefined;
			},

			async list(area, since) {
				return alerts.filter((alert) => alert !== undefined && alert.area === area
					&& alert.time > since);
			},

			async listBroadcasts(area, since) {
				return alerts.filter((alert) => alert !== undefined && alert.area === area
					&& alert.time > since && alert.broadcast);
			},

			async validId(id) {
				return alerts[id] !== undefined;
			},

			async getImage(id) {
				return alerts[id].image;
			},

			async getArea(id) {
				return alerts[id].area;
			},

			async updateInfo(id, info) {
				alerts[id] = info;
			}
		},

		area: {
			async add(info) {
				areas.push(info);
			},

			async remove(id) {
				areas[id] = undefined;
			},

			async list() {
				return areas.filter((area) => area !== undefined);
			},

			async validId(id) {
				return areas[id] !== undefined;
			},

			async getBorder(id) {
				return areas[id].border;
			},

			async getInfo(id) {
				return areas[id];
			},

			async updateInfo(id, info) {
				areas[id] = info;
			}
		},

		points: {
			async add(info) {
				points.push(info);
			},

			async list(area, since) {
				return points.filter((point) => point.area == area && point.time > since);
			},

			async countNearbyPoints(info) {
				return points.filter((point) => {
					const dLat = point.lat - points[id].lat;
					const dLng = point.lng - points[id].lng;
					return dLat * dLat + dLng * dLng <= 1;
				}).length;
			}
		},

		reward: {
			async add(info) {
				info.coinValue = 0;
				info.verified = false;
				rewards.push(info);
			},

			async remove(id) {
				rewards[id] = undefined;
			},

			async list() {
				return rewards.filter((reward) => reward !== undefined && reward.verified);
			},

			async listNew() {
				return rewards.filter((reward) => reward !== undefined && !reward.verified);
			},

			async listOwned(area) {
				return rewards.filter((reward) => reward !== undefined && reward.area === area);
			},

			async validId(id) {
				return rewards[id] !== undefined;
			},

			async getImage(id) {
				return rewards[id].image;
			},

			async getArea(id) {
				return rewards[id].area;
			},

			async updateInfo(id, info) {
				info.coinValue = rewards[id].coinValue;
				info.verified = false;
				rewards[id] = info;
			},

			async verifyCoinValue(id, coinValue) {
				rewards[id].coinValue = coinValue;
				rewards[id].verified = true;
			}
		},

		superadmin: {
			async add(info) {
				superadmins.push(info);
			},

			async remove(id) {
				superadmins[id] = undefined;
			},

			async list() {
				return superadmins.filter((admin) => admin !== undefined).map((admin) => {
					const result = {};
					for(let key in admin) {
						if(key !== "password") {
							result[key] = admin[key];
						}
					}
					return result;
				});
			},

			async validId(id) {
				return superadmins[id] !== undefined;
			},

			async find(username) {
				const index = superadmins.findIndex((admin) => admin !== undefined
					&& admin.username === username);
				return index >= 0 ? index : null;
			},

			async getPassword(id) {
				return superadmins[id].password;
			},

			async setPassword(id, password) {
				superadmins[id].password = password;
			},

			async getInfo(id) {
				const admin = {};
				for(let key in superadmins[id]) {
					if(key !== "password") {
						admin[key] = superadmins[id][key];
					}
				}
				return admin;
			},

			async updateInfo(id, info) {
				info.username = superadmins[id].username;
				info.password = superadmins[id].password;
				superadmins[id] = info;
			}
		},

		user: {
			async add(info) {
				info.latestTime = 0;
				users.push(info);
			},

			async remove(id) {
				users[id] = undefined;
			},

			async validId(id) {
				return users[id] !== undefined;
			},

			async find(username) {
				const index = users.findIndex((user) => user !== undefined
					&& user.username === username);
				return index >= 0 ? index : null;
			},

			async getPassword(id) {
				return users[id].password;
			},

			async setPassword(id, password) {
				users[id].password = password;
			},

			async getInfo(id) {
				const user = {};
				for(let key in users[id]) {
					if(key !== "password" && key !== "latestTime") {
						user[key] = users[id][key];
					}
				}
				return user;
			},

			async updateInfo(id, info) {
				info.username = users[id].username;
				info.password = users[id].password;
				info.latestTime = users[id].latestTime;
				users[id] = info;
			},

			async getWalletAddress(id) {
				return users[id].walletAddress;
			},

			async getLatestTime(id) {
				return users[id].latestTime;
			}
		}
	};
};
