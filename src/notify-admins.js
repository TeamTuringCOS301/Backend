const config = require("./config.js");
const https = require("https");

module.exports = (alert, tokens, hostname) => {
	for(let token of tokens) {
		https.request("https://fcm.googleapis.com/fcm/send", {
			method: "POST",
			headers: {
				"Authorization": `key=${config.notification.firebaseKey}`,
				"Content-Type": "application/json"
			}
		}).end(JSON.stringify({
			notification: {
				title: "New ERP Alert",
				body: alert.title,
				icon: `https://${hostname}${config.notification.icons[alert.severity]}`,
				click_action: `https://${hostname}${config.notification.click}`
			},
			to: token
		}));
	}
};
