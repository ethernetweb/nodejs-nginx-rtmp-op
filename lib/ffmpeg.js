exports.ffmDo = function(lObj,obj,callback) {
  lObj.dbg.dout(lObj.config,__filename,"ffmDo",obj);
  var ffmpeg = require("fluent-ffmpeg");

  var proc = ffmpeg({source:obj.input,nicencess:19}).inputOptions(["-y","-threads 0"]);
  var bufsize = Math.floor(obj.vbr/2);
  var maxrate = Math.floor(obj.vbr*2.5);

  proc.outputOptions([
 "-multiple_requests 1",
 "-b:v "+obj.vbr+"k",
]);

// "-maxrate "+maxrate+"k"
// "-bufsize "+bufsize+"k"
// "-profile:v baseline -level 3.0"

  if (obj.changes.fps) { proc.addOutputOption("-r "+obj.fps); }
  if (obj.changes.abr) { proc.addOutputOption("-b:a "+obj.abr+"k"); }

  if (obj.changes.flv) { proc.flvmeta().format("flv"); }

  proc.output(obj.output);

  if (obj.changes.res) { proc.size(obj.vw+"x"+obj.vh); }
  if (obj.changes.h264) { proc.videoCodec("libx264"); }
  if (obj.changes.aac) { proc.audioCodec("aac"); }

  proc.run();

  proc.on("start",function(data) { console.log(data); return callback(true,1); });

  proc.on("end",function() {
    lObj.publish.SetOffline(lObj,obj.stream,function(ret) { return callback(false,0); });
  });

  proc.on("error",function(err) {
    lObj.publish.SetOffline(lObj,obj.stream,function(ret) {
      console.log(" *** FFMPEG ERR: "+err); console.log(err.stack);
      return callback(false,0);
    });
  });
};
