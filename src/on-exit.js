module.exports = (handler) => {
	process.on('SIGHUP', handler);
	process.on('SIGINT', handler);
	process.on('SIGTERM', handler);
};
