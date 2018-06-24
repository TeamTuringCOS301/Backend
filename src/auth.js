class AuthError {}

module.exports = (db) => ({
	AuthError,

	async isSuperAdmin(req) {
		if(!("superId" in req.session)) {
			return false;
		}
		req.superId = parseInt(req.session.superId);
		return await db.superadmin.validId(req.superId);
	},

	async requireSuperAdmin(req) {
		if(!await this.isSuperAdmin(req)) {
			throw new AuthError();
		}
	},

	async isAdmin(req) {
		if(!("adminId" in req.session)) {
			return false;
		}
		req.adminId = parseInt(req.session.adminId);
		return await db.admin.validId(req.adminId);
	},

	async requireAdmin(req) {
		if(!await this.isAdmin(req)) {
			throw new AuthError();
		}
	},

	async requireAreaAdmin(req, area) {
		if(!await this.isAdmin(req) || await db.admin.getArea(req.adminId) !== area) {
			throw new AuthError();
		}
	},

	async isUser(req) {
		if(!("userId" in req.session)) {
			return false;
		}
		req.userId = parseInt(req.session.userId);
		return await db.user.validId(req.userId);
	},

	async requireUser(req) {
		if(!await this.isUser(req)) {
			throw new AuthError();
		}
	}
});
