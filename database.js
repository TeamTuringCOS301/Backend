var mysql=require('mysql');

var con=mysql.createConnection({
  host: "localhost",
  user: "*****",
  password: "******",
  database: "erp"
});


exports.addUser=function(info){
  con.query("INSERT INTO test VALUES ("+info+")");
}

var result;

function check(name){
  con.query("SELECT * FROM test WHERE name='"+name+"'",function(err,results,fields){
    if(err) throw err;
    if(Object.keys(results).length==0){
      result="N";
    }else{
      result="Y";

    }
  });
}
exports.verifyUser=function(name){
  result="";
  check(name)
  while(result===""){}
  return result;
}
