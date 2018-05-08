exports.adminLogin = (username, password) => {
	return new Promise((resolve, reject) => {
		resolve(username == password);
	});
};

exports.registerUser = (json) => {
	return new Promise((resolve, reject) => {
		resolve(false);
	});
};

exports.userLogin = (username, password) => {
	return new Promise((resolve, reject) => {
		resolve(username == password);
	});
};
