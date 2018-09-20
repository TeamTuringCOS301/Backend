module.exports = () => {
	let email = {user: {}, subject: "", message: "", attachments: []};

	async function sendMail(user, subject, message, attachments = []) {
		email = {user, subject, message, attachments};
	}

	sendMail.testLastEmail = () => email;

	return sendMail;
};
