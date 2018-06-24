USE dbERPCOIN;

INSERT INTO tblSuperAdminUser (
	sadUsername,
	sadEmailAddress,
	sadPassword,
	sadName,
	sadSurname
) VALUES (
	"admin",
	"admin@erp.coin",
	"$2b$10$Je4jhW7cPYREOxsIqmzKXu/ug3eJNOeVv/sOS1AjJ0ljeb99EelNS",
	"John",
	"Smith"
);

INSERT INTO tblUser (
	usrUsername,
	usrEmailAddress,
	usrPassword,
	usrName,
	usrSurname,
	usrWalletAddress,
  usrLastPointTime
) VALUES (
	"darius",
	"darius@erp.coin",
	"$2b$10$3qi0jsHBUBHZX9DucNCPRuG8KJr9RBYJBDF4xkqc/LMWX5BAVPhzi",
	"Darius",
	"Scheepers",
	"0xf17f52151ebef6c7334fad080c5704d77216b732",
  0
);

INSERT INTO tblUser (
	usrUsername,
	usrEmailAddress,
	usrPassword,
	usrName,
	usrSurname,
	usrWalletAddress,
  usrLastPointTime
) VALUES (
	"kyle",
	"kyle@erp.coin",
	"$2b$10$3qi0jsHBUBHZX9DucNCPRuG8KJr9RBYJBDF4xkqc/LMWX5BAVPhzi",
	"Kyle",
	"Pretorius",
	"0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef",
  0
);

INSERT INTO tblUser (
	usrUsername,
	usrEmailAddress,
	usrPassword,
	usrName,
	usrSurname,
	usrWalletAddress,
  usrLastPointTime
) VALUES (
	"richard",
	"richard@erp.coin",
	"$2b$10$3qi0jsHBUBHZX9DucNCPRuG8KJr9RBYJBDF4xkqc/LMWX5BAVPhzi",
	"Richard",
	"Dixie",
	"0x821aea9a577a9b44299b9c15c88cf3087f3b5544",
	0
);

INSERT INTO tblUser (
	usrUsername,
	usrEmailAddress,
	usrPassword,
	usrName,
	usrSurname,
	usrWalletAddress,
  usrLastPointTime
) VALUES (
	"sewis",
	"sewis@erp.coin",
	"$2b$10$3qi0jsHBUBHZX9DucNCPRuG8KJr9RBYJBDF4xkqc/LMWX5BAVPhzi",
	"Sewis",
	"van Wyk",
	"0x0d1d4e623d10f9fba5db95830f7d3839406c6af2",
	0
);

INSERT INTO tblUser (
	usrUsername,
	usrEmailAddress,
	usrPassword,
	usrName,
	usrSurname,
	usrWalletAddress,
  usrLastPointTime
) VALUES (
	"tristan",
	"tristan@erp.coin",
	"$2b$10$3qi0jsHBUBHZX9DucNCPRuG8KJr9RBYJBDF4xkqc/LMWX5BAVPhzi",
	"Tristan",
	"Rothman",
	"0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e",
	0
);

INSERT INTO tblUser (
	usrUsername,
	usrEmailAddress,
	usrPassword,
	usrName,
	usrSurname,
	usrWalletAddress,
  usrLastPointTime
) VALUES (
	"ulrik",
	"ulrik@erp.coin",
	"$2b$10$3qi0jsHBUBHZX9DucNCPRuG8KJr9RBYJBDF4xkqc/LMWX5BAVPhzi",
	"Ulrik",
	"de Muelenaere",
	"0x2191ef87e392377ec08e7c08eb105ef5448eced5",
	0
);
