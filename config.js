var config = {};

config.banner = "NGINX-RTMP On Publish Handler by EthernetWeb";

config.debugout = true; // display output of functions when called
config.dev = false; // if dev don't do certain things

config.dir_home = "/home/nrserver/nginx-rtmp-op";
config.dir_lib = config.dir_home+"/lib";

if (!config.dev) {
  var nlisten = "localhost", nlport = 1945, nserver = "localhost",
 npublisher = "live", noutput = "livestream", nport = 1935, nstatsport = 2100,
 nstatspath = "/stats";
} else {
  var nlisten = "0.0.0.0", nlport = 19450, nserver = "localhost",
 npublisher = "live", noutput = "live-test", nport = 19350, nstatsport = 2100;
 nstatspath = "/stats";
}
config.nginx_listen = nlisten;
config.nginx_lport = nlport;
config.nginx_server = nserver;
config.nginx_publisher = npublisher;
config.nginx_output = noutput;
config.nginx_port = nport;
config.nginx_statsport = nstatsport;
config.nginx_statspath = nstatspath;

module.exports = config;
