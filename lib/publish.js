exports.handler = function(lObj,req,res,callback) {
  var ip = req.connection.remoteAddress;
  lObj.dbg.dout(lObj.config,__filename,"handler","Connection: "+ip);
  if (typeof req.body === "object") {
    var post = req.body;
    if (lObj.config.dev) { console.log(post); }
    if ((typeof post.call !== "undefined") && (typeof post.name !== "undefined")) {
      var sName = post.name.toLowerCase();
      if (post.call === "publish") {
// use these later for verification
var code = 200, reason = "OK";
        lObj.publish.AlreadyStreaming(lObj,sName,function(already) {
          if (already) { code = "403", reason = "Already streaming!"; }
          res.setHeader('Content-Type', 'text/html');
          res.writeHead(code, reason);
          res.end(reason);
          if (code == 200) {
            lObj.online.push(sName);
            setTimeout(function() { // because the stats don't report fast enough.... yeah... sigh
              lObj.publish.StartStream(lObj,sName,function(started,stype) {
                 lObj.dbg.dout(lObj.config,__filename,"handler-publish-StartStream",started+ " "+stype);
                 if ((started) && (stype == 1)) { // started ok
                 } else { lObj.online.splice(lObj.online.indexOf(sName),1); }
                 return callback(lObj.online);
              });
            },5000);
            return callback(lObj.online);
          } else { return callback(lObj.online); } // code not 200
        });
      } else if (post.call === "publish_done") {
        lObj.dbg.dout(lObj.config,__filename,"handler-publish_done",ip+" "+sName);
        return callback(lObj.online);
      }
    } else { return callback(lObj.online); }
  } else { return callback(lObj.online); }
};



exports.StartStream = function(lObj,stream,callback) {
  lObj.dbg.dout(lObj.config,__filename,"StartStream",stream);
  lObj.server.ServerStats(lObj,function(sstats) {
    if (typeof sstats === "object") {
      if (sstats.name === lObj.config.nginx_publisher) {
        if ((typeof sstats.live !== "undefined") && (sstats.live.length > 0)) { // multiple publishers
          Object.keys(sstats.live).forEach(function(i) {
            var sslo = sstats.live[i];
            lObj.publish.StartStreamDo(lObj,sslo,stream,function(cb,stype) {
              return callback(cb,stype);
            });
          });
        } else {
          if ((sstats.name === "live") && (sstats.live.name === stream)) { // one publisher
            lObj.publish.StartStreamDo(lObj,sstats.live,stream,function(cb,stype) {
              return callback(cb,stype);
            });
          }
        }
      } else { return callback(false,0); }
    } else { return callback(false,0); }
  });
};


exports.StartStreamDo = function(lObj,obj,stream,callback) {
  lObj.server.getUserStats(lObj,obj,stream,function(ret) {
    if (typeof ret === "object") {
      if (typeof ret.meta === "object") {
        var changes = {flv:true};
// get stream metadata
        var meta = ret.meta;
        var metaV = meta.video, metaA = meta.audio;
        var width = metaV.width, height = metaV.height, fps = metaV.frame_rate,
 vcodec = metaV.codec;
        if (fps > 30) { changes.fps = true, fps = 30; }
        var vbr = Math.floor(width*height*fps);
        if (vbr > 0) { vbr = Math.floor(vbr/10240); }
        var acodec = metaA.codec, channels = metaA.channels, asr = metaA.sample_rate;
        var abr = Math.floor(asr*channels*8);
        if (abr > 0) { abr = Math.floor(abr/1024); }
        if (abr > 196) { abr = 196; }

lObj.dbg.dout(lObj.config,__filename,"StartStreamDo","stream: "+stream+" width: "+width+" height: "+height+" fps: "+fps+" vbr: "+vbr+" vcodec: "+vcodec+" acodec: "+acodec+" channels: "+channels+" asr: "+asr+" abr: "+abr);

        if (vcodec.toLowerCase() !== "h264") { changes.h264 = true; }
//        if (acodec.toLowerCase() !== "aac") { changes.aac = true; }
        changes.aac = true;

        var input = "rtmp://"+lObj.config.nginx_server+":"+lObj.config.nginx_port+"/"+lObj.config.nginx_publisher+"/"+stream;
        var output = "rtmp://"+lObj.config.nginx_server+":"+lObj.config.nginx_port+"/"+lObj.config.nginx_output+"/"+stream;

        var ffObj = {stream:stream,input:input,output:output,vbr:vbr,changes};
        lObj.ffmpeg.ffmDo(lObj,ffObj,function(cb,stype) { return callback(cb,stype); });
      } else { return callback(false,0); }
    } else { return callback(false,0); }
  });
};


exports.SetOffline = function(lObj,stream,callback) {
  if (typeof stream === "string") { lObj.online.splice(lObj.online.indexOf(stream),1); }
  return callback(lObj.online);
};


exports.AlreadyStreaming = function(lObj,stream,callback) {
  if (lObj.online.indexOf(stream) > -1) {
    lObj.dbg.dout(lObj.config,__filename,"AlreadyStreaming",stream);
    callback(true);
  } else { callback(false); }
};
