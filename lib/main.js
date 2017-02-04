exports.init = function(lObj) {
  lObj.now = Math.floor(Date.now() / 1000);
  setInterval(function() { lObj.now = Math.floor(Date.now() / 1000); },1000);

  var app = lObj.express();
  var nrserver = lObj.http.createServer(app);
  var bodyParser = require("body-parser"), jsonParser = bodyParser.json(),
 urlencodedParser = bodyParser.urlencoded({ extended: false });

  nrserver.listen(lObj.config.nginx_lport,lObj.config.nginx_listen,function() {
    lObj.dbg.dout(lObj.config,__filename,"init","Server: Listening on "+lObj.config.nginx_listen+":"+lObj.config.nginx_lport);
  });

  app.post('/', urlencodedParser, function (req,res) {
    lObj.publish.handler(lObj,req,res,function(l) {
      if (typeof l === "object") { lObj.online = l; }
    });
  });
};
