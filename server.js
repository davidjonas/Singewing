#!/usr/bin/env node

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

var log = function (msg){
  var date = new Date();
  console.log("[" + date.toLocaleDateString('en-GB') + " - " +date.toLocaleTimeString('en-GB') + "] " + msg);
};

var getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

var validateUser = function(user) {
  for (var i=0; i<users.length; i++)
  {
    if(users[i]["name"] == user["name"] || users[i]["socketId"] == user["socketId"])
    {
      return false;
    }
  }

  return true;
}

var findUser = function (socketId) {
  for (var i=0; i<users.length; i++)
  {
    if(users[i]["socketId"] == socketId)
    {
      return i;
    }
  }

  return null;
}

//HTTP Service
app.use(express.static('js'));
app.use(express.static('css'));
app.use(express.static('images'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//Socket Service
io.on('connection', function(socket){
  log("User connected");
  socket.emit('connection');
  socket.emit("updateUserList", users); //Updating the user list automatically for new connections

  //test
  socket.on('test', function(){
    //log("Test request received... Emitting ack.");
    socket.emit('ack');
  });

  //ping
  socket.on('sw_ping', function (time){
    var now = new Date().getTime();
    socket.emit('sw_pong', now);
    //log("ping received, sent pong ==> time diff: " + (now - time) + "ms");
  });

  //register
  socket.on('register', function (name) {
    log("Received register request from " + name);
    //var color = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
    var color = [getRandomInt(0, 255), 220, 255];
    var user = {"name": name, "color": color, "socketId": socket.id, "beat":false, "BPM":0};

    log("name: " + user["name"] + "   ==>   color:" + user["color"] + "   ==>   socket:" + user["socketId"]);

    if(validateUser(user))
    {
      //log("User validated");
      users.push(user);
      io.emit("newUser", user);
      log(users.length + " Users online");
    }
    else
    {
      log("user already exists.");
      socket.emit("registrationError", "User already registered.");
    }
  });

  //Update user list
  socket.on("updateUserList", function (){
    socket.emit("updateUserList", users);
  });

  //Beat
  socket.on("beat", function (args){
    socket.broadcast.emit("beat", {"socketId": socket.id, "time": args["time"], "BPM": args["BPM"]});
  });

  //Disconnect
  socket.on('disconnect', function(){
    log('User disconnected');
    var index = findUser(socket.id);
    if(index != null)
    {
      log("removing user " + users[index]["name"]);
      io.emit("userQuit", users[index]);
      users.splice(index, 1);
      log(users.length + " users left.");
      io.emit("updateUserList", users);
    }
    else
    {
      log("user not found. just disconencted without registering. This is not necessarily a problem.");
    }
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
