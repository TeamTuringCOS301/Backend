const config = require("./config.js");
const nodemailer = require("nodemailer");
const onExit = require("./on-exit.js");

const transporter = nodemailer.createTransport(config.email.transport);
let queue = [];

function sendMail(options) {
	transporter.sendMail(options, (err) => {
		if(err) {
			console.error(err);
			queue.push(options);
		}
	});
}

module.exports = (user, subject, message, attachments = []) => {
	sendMail({
		from: config.email.from,
		to: user.email,
		subject,
		text: `Hi ${user.name},\n\n${message}\n\nKind regards,\nERP-Coin team`,
		attachments
	});
};

const timer = setInterval(() => {
	const pending = queue;
	queue = [];
	for(let options of pending) {
		sendMail(options);
	}
}, 10000);

onExit(() => {
	clearTimeout(timer);
	if(queue.length > 0) {
		console.log("Pending mail:", queue);
	}
});
