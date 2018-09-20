module.exports = () => {
	let email = {to: "", attachments: -1};

	async function sendMail(user, subject, message, attachments = []) {
		email = {user, subject, message, attachments};
	}

	sendMail.testLastEmail = () => email;

	return sendMail;
};
