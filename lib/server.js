exports.getUserStats = function(lObj,publishing,stream,callback) {
  lObj.dbg.dout(lObj.config,__filename,"getUserStats",stream + " " + publishing.length);
  if (typeof publishing === "object") {
    if (publishing.length > 1) {
      Object.keys(publishing).forEach(function(idx) {
        var liveObj = publishing[idx];
         if (liveObj.name.toLowerCase() === stream.toLowerCase()) { return callback(publishing[idx]); }
      });
    } else {
      if (typeof publishing.name !== "undefined") {
        if (publishing.name.toLowerCase() === stream.toLowerCase()) { return callback(publishing); }
      }
    }
  }
};


exports.getLive = function(lObj,callback) {
  lObj.server.ServerStats(lObj,function(ret) {
    if (typeof ret === "object") {
      if (ret.name === lObj.config.nginx_publisher) {
        if (typeof ret.live === "object") {
          var sName = ret.name;
          Object.keys(ret).forEach(function(i) {
            var liveO = ret[i];
            if (typeof liveO === "object") {
              if (typeof liveO.length !== "undefined") { // multiple bcasters
                Object.keys(liveO).forEach(function(i2) {
                  var stream = liveO[i2].name;
                  lObj.publish.StartStream(lObj,stream,function(started,stype) {
                    if ((started) & (stype == 1)) { return callback(stream); }
                  });
                });
              } else { // single broadcaster
                var stream = liveO.name;
                lObj.publish.StartStream(lObj,stream,function(started,stype) {
                  if ((started) & (stype == 1)) { return callback(un); }
                });
              }
            }
          });
        }
      }
    }
  });
};


exports.ServerStats = function(lObj,callback) {
  var e = {port:lObj.config.nginx_statsport,method:"GET",path:lObj.config.nginx_statspath,host:lObj.config.nginx_server};
  lObj.dbg.dout(lObj.config,__filename,"ServerStats",e);
  lObj.func.RequestURL(lObj,e,function(ret) {
    if (typeof ret === "object") {
      ret = ret.toString("utf8");
      lObj.server.ParseStats(lObj,ret,function(s) {
        if (typeof s === "object") { return callback(s); }
      });
    }
  });
};


exports.ParseStats = function(lObj,str,callback) {
try { // sometimes this parser fails. Maybe switch to the nginx stats json commit?
  var res = lObj.xml2json.toJson(str,{object:true,trim:true});
  if (typeof res === "object") {
    if (typeof res.rtmp === "object") {
      if (typeof res.rtmp.server === "object") {
        var apps = res.rtmp.server.application;
        Object.keys(apps).forEach(function(idx) {
          var live = apps[idx].live, name = apps[idx].name;
          if (typeof live === "object") {
            if (typeof live.stream !== "undefined") {
              var stObj = {"name":name,"live":live.stream};
              return callback(stObj);
            }
          }
        });
      }
    }
  }
} catch(err) { console.log("xml2json parse error "+err); }
};
