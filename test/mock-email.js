module.exports = () => {
	let email = {user: {}, subject: "", message: "", attachments: []};

	function sendMail(user, subject, message, attachments = []) {
		email = {user, subject, message, attachments};
	}

	sendMail.testLastEmail = () => email;

	return sendMail;
};
