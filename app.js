var express = require('express');
var app = express();
var fs = require('fs');
var open = require('open');
var WebSocket = require('ws');
var options = {
  key: fs.readFileSync('./fake-keys/privatekey.pem'),
  cert: fs.readFileSync('./fake-keys/certificate.pem')
};
var serverPort = (process.env.PORT  || 4443);
var https = require('https');
var http = require('http');
var server;
if (process.env.LOCAL) {
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}
var io = new WebSocket.Server({ server });

app.get('/', function(req, res){
  console.log('get /');
  res.sendFile(__dirname + '/index.html');
});
server.listen(serverPort, function(){
  console.log('server up and running at %s port', serverPort);
  if (process.env.LOCAL) {
    open('https://localhost:' + serverPort)
  }
});

function socketIdsInRoom(name) {
  var socketIds = io.nsps['/'].adapter.rooms[name];
  if (socketIds) {
    var collection = [];
    for (var key in socketIds) {
      collection.push(key);
    }
    return collection;
  } else {
    return [];
  }
}

var count = 0;
var clients = [];

io.on('connection', function(socket) {
  var id = clients.length == 0 ? 0: clients.length;
  clients[id] = socket;
  socket['unique_id'] = id;
  console.log((new Date()) + ' Connection accepted [' + id + ']. AND LENGTH IS ', clients.length);
  
  socket.on('message', function incoming(message) {
    var msg = JSON.parse(message);
    io.broadcast(message);
  });

	socket.on('close', function(code, message){
    console.log("SOCKET UNIQUE ID IS ", socket.unique_id);
		clients.splice(socket.unique_id,1);
    console.log((new Date()) + ' DELETING SOCKET AT POSITION ' + socket.unique_id + ' disconnected. COUNT IS ', clients.length);
    
});
});

io.broadcast = function(data) {
  // Loop through all clients
  for(var i in clients){
    if(clients[i].readyState === WebSocket.OPEN) {
      // Send a message to the client with the message
      clients[i].send(data);
    }
  }
/*
	io.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});*/
};

/*

function socketIdsInRoom(name) {
  var socketIds = io.nsps['/'].adapter.rooms[name];
  if (socketIds) {
    var collection = [];
    for (var key in socketIds) {
      collection.push(key);
    }
    return collection;
  } else {
    return [];
  }
}

io.on('connection', function(socket){
  console.log('connection');
  socket.on('disconnect', function(){
    console.log('disconnect');
    if (socket.room) {
      var room = socket.room;
      io.to(room).emit('leave', socket.id);
      socket.leave(room);
    }
  });

  socket.on('join', function(name, callback){
    console.log('join', name);
    var socketIds = socketIdsInRoom(name);
    callback(socketIds);
    socket.join(name);
    socket.room = name;
  });


  socket.on('exchange', function(data){
    console.log('exchange', data);
    data.from = socket.id;
    var to = io.sockets.connected[data.to];
    to.emit('exchange', data);
  });
});
*/