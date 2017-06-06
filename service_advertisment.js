var mdns    = require('mdns');

var protocl = "http";

// advertise a http server on port 4321
var ad = mdns.createAdvertisement(mdns.tcp(protocl), 3000, {name: "huddly-stream-service"});
ad.start();
console.log('Advertising on ', protocl);