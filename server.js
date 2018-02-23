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
app.use(express.static('sounds'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/leap', function(req, res){
  res.sendFile(__dirname + '/leap.html');
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
  socket.on('register', function (args) {
    var name = args["name"];
    log("Received register request from " + name);
    //var color = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
    //var color = [getRandomInt(0, 255), 220, 255];
    var color = [parseInt(args["color"]), 220, 225];
    var sound = args["sound"];
    var user = {"name": name, "color": color, "sound":sound, "socketId": socket.id, "beat":false, "BPM":0, "pattern":"1111"};

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

  //setPattern
  socket.on("setPattern", function(args){
    var index = findUser(socket.id);
    users[index]["pattern"] = args;
    socket.broadcast.emit("setPattern", {"socketId": socket.id, "pattern": args});
  });

  //Beat
  socket.on("beat", function (args){
    socket.broadcast.emit("beat", {"socketId": socket.id, "time": args["time"], "BPM": args["BPM"]});
    var index = findUser(socket.id);
    if(index != null)
    {
      users[index]["BPM"] = args["BPM"];
    }

    var result = [];

    for(var u=0; u<users.length; u++)
    {
      for(var o=0; o<users.length; o++)
      {
        if(Math.abs(users[u]["BPM"] - users[o]["BPM"]) < 5 &&
          users[u]["BPM"] != 0 &&
          users[o]["BPM"] != 0 &&
          o != u)
        {
          if(result.indexOf(o) == -1)
          {
            result.push(o);
          }
          if(result.indexOf(u) == -1)
          {
            result.push(u);
          }
        }
      }
    }

    io.emit("match", result);
    if(result.length == users.length)
    {
      var bpm = 0;
      for(var u=0; u<users.length; u++)
      {
        bpm += users[u]["BPM"];
      }
      bpm = bpm / users.length;

      for(var u=0; u<users.length; u++)
      {
        users[u]["BPM"] = bpm;
        users[u]["pattern"] = "0000";
      }

      io.emit("updateUserList", users);
      io.emit("phase", {"number":1, "data":{"BPM": Math.floor(bpm)}});
    }
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
