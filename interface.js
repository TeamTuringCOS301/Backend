var http = require('http');
var db=require('./database');
var url=require('url');


http.createServer(function (req, res) {
    if(req.url!="/favicon.ico"){
      res.writeHead(200, {'Content-Type': 'text/html'});
    req.url=req.url.slice(1);
    if(req.url.substring(0,2)==='A:'){
      req.url=req.url.slice(2);
      db.addUser(req.url,function(err){
        res.end("Node.js Server");
      });
    }else if(req.url.substring(0,2)==='V:'){
      req.url=req.url.slice(2);
      db.verifyUser(req.url,function(err,result){
        res.write("");
        res.end("Node.js Server");
      });
    }
  }

}).listen(8080,'0.0.0.0');
