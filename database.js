var mysql=require('mysql');

var con=mysql.createConnection({
  host: "localhost",
  user: "*****",
  password: "******",
  database: "erp"
});


exports.addUser=function(info,callback){
  con.query("INSERT INTO test VALUES ("+info+")",function(err){
    callback(err);
  });
}

exports.verifyUser=function(name,callback){
  con.query("SELECT * FROM test WHERE name='"+name+"'",function(err,results,fields){
    if(err) callback(err);
    if(Object.keys(results).length==0){
      callback(null,"N");
    }else{
      callback(null,"Y");

    }
  });
}
