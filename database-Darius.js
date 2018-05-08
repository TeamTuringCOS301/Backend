
//exports.adminLogin = (username, password) => {
//	return new Promise((resolve, reject) => {
//		resolve(username == password);
//	});
//};


var mysql = require("mysql");

var con = mysql.createConnection({
	host: "localhost",
	user: "root", // root
	password: "TeamTuring1", //TeamTuring1
	database: "dbERPCoin" //dbERPCoin
});

exports.adminLogin = (username, password) => {
	return new Promise((resolve, reject) => {
    connection.query('SELECT admID FROM tblAdminUser WHERE admUsername = ? AND admPassword = ?'),
      [username, password], function(err,results)
      {
        if (err)
        {
          return reject(err);
        }
        else {
          if (resuls != null)
          {
            console.log("success: " + result);
            return reslove(result);
          }
          else {
            return resolve(null);
          }
        }
      });
	});
};

exports.registerUser = (json) => {
	return new Promise((resolve, reject) => {
    connection.query('INSERT INTO tblUser (usrUsername,usrEmailAddress,usrPassword,usrName,usrSurname,usrCellNumber) Values (?, ?, ?, ? )',
      [json.username,json.email, json.password, json.name, json.surname, json.cellnumber], function(err,results)
      {
        if (err)
        {
          return reject(err);
        }
        else {
          if (resuls != null)
          {
            console.log("success: " + result);
            return reslove("result");
          }
          else {
            return resolve(null);
          }
        }
      });
	});
};

exports.userLogin = (username, password) => {
	return new Promise((resolve, reject) => {
    connection.query('SELECT usrID FROM tblUser WHERE usrUsername = ? AND usrPassword = ?'),
      [username, password], function(err,results)
      {
        if (err)
        {
          return reject(err);
        }
        else {
          if (resuls != null)
          {
            console.log("success: " + result);
            return reslove(result);
          }
          else {
            return resolve(null);
          }
        }
      });
	});
};
  // Darius added this
exports.getUserID = (username) => {
  return new Promise((resolve,reject) => {
    connection.query('SELECT usrID FROM tblUser WHERE usrUsername = ?'),
      [username], function(err,results)
      {
        if (err)
        {
          return reject(err);
        }
        else {
          if (resuls != null)
          {
            console.log("success: " + result);
            return reslove(result);
          }
          else {
            return resolve(null);
          }
        }
      });
  });
}

//