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
				admins.push(Object.assign({}, info));
			},

			async remove(id) {
				delete admins[id];
			},

			async list() {
				return admins.map((info) => Object.assign({}, info));
			},

			async validId(id) {
				return id in admins;
			},

			async find(username) {
				const index = admins.findIndex((info) => info !== undefined
					&& info.username === username);
				return index >= 0 ? index : null;
			},

			async getPassword(id) {
				return admins[id].password;
			},

			async setPassword(id, password) {
				admins[id].password = password;
			},

			async getInfo(id) {
				return Object.assign({}, admins[id]);
			},

			async updateInfo(id, info) {
				Object.assign(admins[id], info);
			},

			async getArea(id) {
				return admins[id].area;
			}
		},

		alert: {
			async add(info) {
				alerts.push(Object.assign({broadcast: false}, info));
			},

			async remove(id) {
				delete alerts[id];
			},

			async list(area, since) {
				return alerts.filter((info) => info.area === area && info.time > since)
					.map((info) => Object.assign({}, info));
			},

			async listBroadcasts(area, since) {
				return alerts.filter((info) => info.area === area && info.time > since
					&& alert.broadcast).map((info) => Object.assign({}, info));
			},

			async validId(id) {
				return id in alerts;
			},

			async getImage(id) {
				return alerts[id].image;
			},

			async getArea(id) {
				return alerts[id].area;
			},

			async updateInfo(id, info) {
				Object.assign(alerts[id], info);
			}
		},

		area: {
			async add(info) {
				areas.push(Object.assign({}, info));
			},

			async remove(id) {
				delete areas[id];
			},

			async list() {
				return areas.map((info) => Object.assign({}, info));
			},

			async validId(id) {
				return id in areas;
			},

			async getBorder(id) {
				return areas[id].border;
			},

			async getInfo(id) {
				return Object.assign({}, areas[id]);
			},

			async updateInfo(id, info) {
				Object.assign(areas[id], info);
			},

			async getPrimaryAdmin(id, info) {
				const index = admins.findIndex((info) => info !== undefined
					&& info.area === id);
				return index >= 0 ? index : null;
			}
		},

		point: {
			async add(info) {
				points.push(Object.assign({}, info));
				users[info.user].latestTime = info.time;
			},

			async list(area, since) {
				return points.filter((info) => info.area == area && info.time > since)
					.map((info) => Object.assign({}, info));
			},

			async countNearbyPoints(info) {
				return points.filter((point) => Math.pow(point.lat - info.lat, 2)
					+ Math.pow(point.lng - info.lng, 2) <= 1).length;
			}
		},

		reward: {
			async add(info) {
				rewards.push(Object.assign({coinValue: 0, verified: false}, info));
			},

			async remove(id) {
				delete rewards[id];
			},

			async list() {
				return rewards.filter((info) => info.verified)
					.map((info) => Object.assign({}, info));
			},

			async listNew() {
				return rewards.filter((info) => !info.verified)
					.map((info) => Object.assign({}, info));
			},

			async listOwned(area) {
				return rewards.filter((info) => info.area === area)
					.map((info) => Object.assign({}, info));
			},

			async validId(id) {
				return id in rewards;
			},

			async getImage(id) {
				return rewards[id].image;
			},

			async getArea(id) {
				return rewards[id].area;
			},

			async getInfo(id) {
				return Object.assign({}, rewards[id]);
			},

			async updateInfo(id, info) {
				Object.assign(rewards[id], info);
			},

			async setAmount(id, amount) {
				rewards[id].amount = amount;
			},

			async verifyCoinValue(id, verify, coinValue) {
				rewards[id].coinValue = coinValue;
				rewards[id].verified = verify;
			}
		},

		superadmin: {
			async add(info) {
				superadmins.push(Object.assign({}, info));
			},

			async remove(id) {
				delete superadmins[id];
			},

			async list() {
				return superadmins.map((info) => Object.assign({}, info));
			},

			async validId(id) {
				return id in superadmins;
			},

			async find(username) {
				const index = superadmins.findIndex((info) => info !== undefined
					&& info.username === username);
				return index >= 0 ? index : null;
			},

			async getPassword(id) {
				return superadmins[id].password;
			},

			async setPassword(id, password) {
				superadmins[id].password = password;
			},

			async getInfo(id) {
				return Object.assign({}, superadmins[id]);
			},

			async updateInfo(id, info) {
				Object.assign(superadmins[id], info);
			}
		},

		user: {
			async add(info) {
				users.push(Object.assign(
					{walletAddress: null, coinBalance: 0, latestTime: 0},
					info
				));
			},

			async remove(id) {
				delete users[id];
			},

			async validId(id) {
				return id in users;
			},

			async find(username) {
				const index = users.findIndex((info) => info !== undefined
					&& info.username === username);
				return index >= 0 ? index : null;
			},

			async findByAddress(address) {
				const index = users.findIndex((info) => info !== undefined
					&& info.walletAddress === address);
				return index >= 0 ? index : null;
			},

			async getPassword(id) {
				return users[id].password;
			},

			async setPassword(id, password) {
				users[id].password = password;
			},

			async getInfo(id) {
				return Object.assign({}, users[id]);
			},

			async updateInfo(id, info) {
				Object.assign(users[id], info);
			},

			async clearWalletAddress(id) {
				users[id].walletAddress = null;
			},

			async setWalletAddress(id, address) {
				users[id].walletAddress = address;
				users[id].coinBalance = 0;
			},

			async getWalletAddress(id) {
				return users[id].walletAddress;
			},

			async getUnclaimedBalance(id) {
				return users[id].coinBalance;
			},

			async setUnclaimedBalance(id, balance) {
				users[id].coinBalance = balance;
			},

			async rewardCoin(id) {
				++users[id].coinBalance;
			},

			async getLatestTime(id) {
				return users[id].latestTime;
			}
		}
	};
};
