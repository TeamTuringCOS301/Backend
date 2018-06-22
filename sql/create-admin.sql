INSERT INTO dbERPCOIN.tblAdminUser (
	admUsername,
	admEmailAddress,
	admPassword,
	admName,
	admSurname,
	admSuperAdmin,
    tblConservationArea_conID
) VALUES (
	"admin",
	"admin@erp.coin",
	"$2b$10$Je4jhW7cPYREOxsIqmzKXu/ug3eJNOeVv/sOS1AjJ0ljeb99EelNS", 
	"John",
	"Smith",
	1,
    1
);
