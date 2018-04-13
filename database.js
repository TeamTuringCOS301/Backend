var mysql=require('mysql');

var con=mysql.createConnection({
  host: "localhost",
  user: "*****",
  password: "******",
  database: "erp"
});


exports.addUser=function(info){
  return new Promise((resolve,reject)=>{
    con.query("INSERT INTO test VALUES ("+info+")",function(err){
      if(err) reject(err);
      else resolve();
    });
  });
};

exports.verifyUser=function(name){
  return new Promise((resolve,reject)=>{
    con.query("SELECT * FROM test WHERE name='"+name+"'",function(err,results,fields){
      if(err) reject(err);
      if(Object.keys(results).length==0){
        resolve("N");
      }else{
        resolve("Y");
      }
    });
  });
};

// Dummy function.
exports.getUser=function(id){
  return new Promise((resolve,reject)=>{
    resolve({username: "test"});
  });
};
