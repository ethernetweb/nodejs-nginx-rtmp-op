var fs		= require("fs"),
 express	= require("express"),
 http		= require("http"),
 xml2json	= require("xml2json"),
 exec           = require("child_process").exec;

var config	= require("./config.js"),
 dbg		= require("./debug.js"),
 func		= require(config.dir_lib+"/functions.js"),
 main		= require(config.dir_lib+"/main.js"),
 publish	= require(config.dir_lib+"/publish.js"),
 server		= require(config.dir_lib+"/server.js"),
 ffmpeg		= require(config.dir_lib+"/ffmpeg.js");

dbg.dout(config,__filename,"ROOT",config.banner);


if (!config.dev) {
  exec("/usr/bin/pkill ffmpeg", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}


var obj = {"config":config,"fs":fs,"express":express,"http":http,"xml2json":xml2json,
"dbg":dbg,"func":func,"main":main,"publish":publish,"server":server,"ffmpeg":ffmpeg,"online":[]};

main.init(obj);
var keys = "";
Object.keys(obj).forEach(function(key) { keys += key+","; });
dbg.dout(config,__filename,"ROOT","Object Keys: "+keys);
