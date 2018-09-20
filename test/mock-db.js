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
				admins.push({
					username: info.username,
					email: info.email,
					password: info.password,
					name: info.name,
					surname: info.surname,
					area: info.area
				});
			},

			async remove(id) {
				delete admins[id];
			},

			async list() {
				return admins.map((info, id) => ({
					id,
					username: info.username,
					email: info.email,
					name: info.name,
					surname: info.surname,
					area: info.area,
					areaName: areas[info.area].name
				})).filter(() => true);
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
				return {
					username: admins[id].username,
					email: admins[id].email,
					name: admins[id].name,
					surname: admins[id].surname,
					area: admins[id].area,
					areaName: areas[admins[id].area].name
				};
			},

			async updateInfo(id, info) {
				admins[id].email = info.email;
				admins[id].name = info.name;
				admins[id].surname = info.surname;
			},

			async getArea(id) {
				return admins[id].area;
			}
		},

		alert: {
			async add(info) {
				alerts.push({
					time: info.time,
					title: info.title,
					description: info.description,
					severity: info.severity,
					image: info.image ? Buffer.from(info.image, "base64") : null,
					broadcast: info.broadcast,
					location: info.location,
					area: info.area,
					user: info.user
				});
			},

			async remove(id) {
				delete alerts[id];
			},

			async list(area, since) {
				return alerts.map((info, id) => ({
					id,
					time: info.time,
					title: info.title,
					description: info.description,
					severity: info.severity,
					hasImage: info.image !== null,
					broadcast: info.broadcast,
					location: info.location,
					area: info.area
				})).filter((info) => info.area === area && info.time > since).map((info) => {
					delete info.area;
					return info;
				});
			},

			async listBroadcasts(area, since) {
				return alerts.map((info, id) => ({
					id,
					time: info.time,
					title: info.title,
					description: info.description,
					severity: info.severity,
					hasImage: info.image !== null,
					broadcast: info.broadcast,
					location: info.location,
					area: info.area
				})).filter((info) => info.area === area && info.time > since).map((info) => {
					delete info.broadcast;
					delete info.area;
					return info;
				});
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
				alerts[id].title = info.title;
				alerts[id].description = info.description;
				alerts[id].severity = info.severity;
				alerts[id].broadcast = info.broadcast;
				alerts[id].location = info.location;
				if(info.image) {
					alerts[id].image = Buffer.from(info.image, "base64");
				}
			}
		},

		area: {
			async add(info) {
				areas.push({
					name: info.name,
					city: info.city,
					province: info.province,
					middle: info.middle,
					border: info.border
				});
			},

			async remove(id) {
				delete areas[id];
			},

			async list() {
				return areas.map((info, id) => ({
					id,
					name: info.name,
					city: info.city,
					province: info.province,
					middle: info.middle
				})).filter(() => true);
			},

			async validId(id) {
				return id in areas;
			},

			async getBorder(id) {
				return areas[id].border;
			},

			async getInfo(id) {
				return {
					name: info.name,
					city: info.city,
					province: info.province,
					middle: info.middle,
					border: info.border
				};
			},

			async updateInfo(id, info) {
				areas[id].name = info.name;
				areas[id].city = info.city;
				areas[id].province = info.province;
				areas[id].middle = info.middle;
				areas[id].border = info.border;
			},

			async getPrimaryAdmin(id, info) {
				const index = admins.findIndex((info) => info !== undefined
					&& info.area === id);
				return index >= 0 ? index : null;
			}
		},

		point: {
			async add(info) {
				points.push({
					time: info.time,
					lat: info.lat,
					lng: info.lng,
					area: info.area
				});
				users[info.user].latestTime = info.time;
			},

			async list(area, since) {
				return points.filter((info) => info.area == area && info.time > since)
					.map((info) => ({
						time: info.time,
						lat: info.lat,
						lng: info.lng
					}));
			},

			async countNearbyPoints(info) {
				return points.filter((point) => Math.pow(point.lat - info.lat, 2)
					+ Math.pow(point.lng - info.lng, 2) <= 1).length;
			}
		},

		reward: {
			async add(info) {
				rewards.push({
					name: info.name,
					description: info.description,
					image: Buffer.from(info.image, "base64"),
					amount: info.amount,
					randValue: info.randValue,
					coinValue: 0,
					verified: false,
					area: info.area
				});
			},

			async remove(id) {
				delete rewards[id];
			},

			async list() {
				return rewards.map((info, id) => ({
					id,
					name: info.name,
					description: info.description,
					amount: info.amount,
					randValue: info.randValue,
					coinValue: info.coinValue,
					verified: info.verified,
					area: info.area,
					areaName: areas[info.area].name
				})).filter((info) => info.verified).map((info) => {
					delete info.verified;
					return info;
				});
			},

			async listNew() {
				return rewards.map((info, id) => ({
					id,
					name: info.name,
					description: info.description,
					amount: info.amount,
					randValue: info.randValue,
					verified: info.verified,
					area: info.area,
					areaName: areas[info.area].name
				})).filter((info) => !info.verified).map((info) => {
					delete info.verified;
					return info;
				});
			},

			async listOwned(area) {
				return rewards.map((info, id) => ({
					id,
					name: info.name,
					description: info.description,
					amount: info.amount,
					randValue: info.randValue,
					coinValue: info.coinValue,
					verified: info.verified,
					area: info.area
				})).filter((info) => info.area === area).map((info) => {
					delete info.area;
					return info;
				});
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
				return {
					name: rewards[id].name,
					description: rewards[id].description,
					amount: rewards[id].amount,
					randValue: rewards[id].randValue,
					coinValue: rewards[id].coinValue,
					verified: rewards[id].verified,
					area: rewards[id].area,
					areaName: areas[rewards[id].area].name
				};
			},

			async updateInfo(id, info) {
				rewards[id].name = info.name;
				rewards[id].description = info.description;
				rewards[id].amount = info.amount;
				rewards[id].randValue = info.randValue;
				if(info.image) {
					rewards[id].image = Buffer.from(info.image, "base64");
				}
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
				superadmins.push({
					username: info.username,
					email: info.email,
					password: info.password,
					name: info.name,
					surname: info.surname
				});
			},

			async remove(id) {
				delete superadmins[id];
			},

			async list() {
				return superadmins.map((info, id) => ({
					id,
					username: info.username,
					email: info.email,
					name: info.name,
					surname: info.surname
				})).filter(() => true);
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
				return {
					username: superadmins[id].username,
					email: superadmins[id].email,
					name: superadmins[id].name,
					surname: superadmins[id].surname
				};
			},

			async updateInfo(id, info) {
				superadmins[id].email = info.email;
				superadmins[id].name = info.name;
				superadmins[id].surname = info.surname;
			}
		},

		user: {
			async add(info) {
				users.push({
					username: info.username,
					email: info.email,
					password: info.password,
					name: info.name,
					surname: info.surname,
					walletAddress: null,
					coinBalance: 0,
					latestTime: 0
				});
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
				return {
					username: users[id].username,
					email: users[id].email,
					name: users[id].name,
					surname: users[id].surname,
					walletAddress: users[id].walletAddress,
					coinBalance: users[id].coinBalance
				};
			},

			async updateInfo(id, info) {
				users[id].email = info.email;
				users[id].name = info.name;
				users[id].surname = info.surname;
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
