var http = require('http');
var db=require('./database');
var url=require('url');


http.createServer(function (req, res) {
    if(req.url!="/favicon.ico"){
      res.writeHead(200, {'Content-Type': 'text/html'});
    req.url=req.url.slice(1);
    if(req.url.substring(0,2)==='A:'){
      req.url=req.url.slice(2);
      db.addUser(req.url);
    }else if(req.url.substring(0,2)==='V:'){
      req.url=req.url.slice(2);
      var result;
      result=db.verifyUser(req.url);
      res.write("");
    }

      res.end("Node.js Server");
  }

}).listen(8080,'0.0.0.0');
