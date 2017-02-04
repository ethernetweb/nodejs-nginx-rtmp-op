exports.dout = function(config,file,func,msg) {
  if (config.debugout) {
    file = file.replace(__dirname+"/","");
    if (typeof msg === "object") { msg = "OBJ: "+JSON.stringify(msg); }
    console.log("["+file+"]->("+func+") "+msg);
  }
};
