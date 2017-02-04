exports.RequestURL = function(lObj,e,callback) {
  var request = lObj.http.request({port:e.port,host:e.host,method:e.method,path:e.path});
  request.on("response", function(res) {
    res.on("data", function(data) {
      if (typeof data === "string") { data = JSON.parse(data); }
      if (typeof data === "object") { return callback(data); }
    });
  });
  request.end();
};


exports.getRandArr = function(arr,callback) {
  callback(arr[Math.floor(Math.random()*arr.length)]);
};


exports.dumpError = function(err) {
  if (typeof err === "object") {
    if (err.message) { console.log("\nMessage: " + err.message) }
    if (err.stack) {
      console.log("\nStacktrace:\n====================")
      console.log(err.stack);
    }
  } else { console.log("dumpError :: argument is not an object. " + err); }
}
