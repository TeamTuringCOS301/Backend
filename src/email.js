const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "erp.erpcoin@gmail.com",
		pass: "correcthorse"
	}
});

module.exports = {
	sendMail(mailOptions) {
		return new Promise((resolve, reject) => {
			transporter.sendMail(mailOptions, (err, info) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
};
