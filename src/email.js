const config = require("./config.js");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(config.email.transport);

module.exports = (user, subject, message, attachments = []) => {
	return new Promise((resolve, reject) => {
		transporter.sendMail({
			from: config.email.from,
			to: user.email,
			subject,
			text: `Hi ${user.name},\n\n${message}\n\nKind regards,\nERP-Coin team`,
			attachments
		}, (err) => {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}
