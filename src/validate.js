const imageType = require("image-type");

module.exports = {
	validateEmail(email) {
		return typeof email === "string"
			&& email.length <= 100
			&& /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
	},

	validateName(name) {
		return typeof name === "string"
			&& name.length > 0
			&& name.length <= 100;
	},

	validateUsername(username) {
		return typeof username === "string"
			&& username.length > 0
			&& username.length <= 100;
	},

	validatePassword(password) {
		return typeof password === "string"
			&& password.length > 0;
	},

	validateText(text) {
		return typeof text === "string"
			&& text.length > 0
			&& text.length <= 100;
	},

	validateDescription(description) {
		return typeof description === "string"
			&& description.length > 0
			&& description.length <= 255;
	},

	validateInt(int) {
		return Number.isInteger(int)
			&& int >= -2147483648
			&& int < 2147483648;
	},

	validateImage(image) {
		return typeof image === "string"
			&& imageType(Buffer.from(image, "base64")) !== null;
	},

	validatePoint(point) {
		return typeof point === "object"
			&& typeof point.lat === "number"
			&& point.lat >= -90
			&& point.lat <= 90
			&& typeof point.lng === "number"
			&& point.lng >= -180
			&& point.lng <= 180;
	}
};
