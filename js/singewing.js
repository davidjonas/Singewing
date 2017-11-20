function UID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

var log = function(msg)
{
  // var date = new Date();
  // var finalMsg = "[" + date.toLocaleDateString('en-GB') + " - " + date.toLocaleTimeString('en-GB') + "] " + msg;
  // $("#debug .contents").append($('<div class="line">'+finalMsg+'</div>'));
  // console.log(finalMsg);
}

var Singewing = function () {
  var self = this;
  this.socket = io();
  this.pingTime = 0;
  this.delay = 0;
  this.offset = 0;
  this.connected = false;
  this.registered = false;
  this.users = [];
  this.name;

  // RX - connection
  this.socket.on('connection', function(){
      self.connected = true;
  });

  //RX - test ACK
  this.socket.on("ack", function () {
    alert("Test successful, message sent and received from the server.");
  });

  // RX -  pong
  this.socket.on('sw_pong', function (time){
    var now = new Date().getTime();
    self.delay = now - self.pingTime;
    var aproxServerTime = Math.round(time + self.delay/2);
    self.offset = now - aproxServerTime;
    log("timeToServer: " + (time - self.pingTime) + "ms    ==>      full delay = " + self.delay + "ms");
    log("Local Time:  " + now);
    log("Server Time: " + time);
    log("Corrected Server Time: " + aproxServerTime);
    log("Approximate offset between server and browser: " + self.offset + "ms");
  });

  //RX - new user
  this.socket.on("newUser", function (user) {
    log(user["name"] +" Joined.");
    self.users.push(user);
    if(user["name"] == self.name)
    {
      self.registered = true;
      registrationSuccess();
    }
  });

  //RX - User disconnected
  this.socket.on("userQuit", function (user){
    log(user["name"] + " Left.");
  });

  //RX - registration error
  this.socket.on("registrationError", function (msg) {
    log(msg);
    registrationError();
  });

  //RX - Update user list Receive
  this.socket.on("updateUserList", function (users) {
    self.users = users;
  });

  this.socket.on("beat", function(socketId)
  {
    var index = self.findUser(socketId);
    self.users[index]["beat"] = true;
  });
};

//TX - ping
Singewing.prototype.ping = function () {
  log("ping");
  this.pingTime = new Date().getTime();
  this.socket.emit("sw_ping", singewing.pingTime);
};

//TX - test
Singewing.prototype.test = function() {
  this.socket.emit("test");
};

//TX - register
Singewing.prototype.register = function () {
  this.name = $("#name").val();
  this.socket.emit("register", this.name);
};

//TX - Get/Update user list
Singewing.prototype.updateUserList = function () {
  this.socket.emit("updateUserList");
};

//TX - beat
Singewing.prototype.beat = function()
{
  this.socket.emit("beat");
}

Singewing.prototype.findUser = function (socketId) {
  for (var i=0; i<this.users.length; i++)
  {
    if(this.users[i]["socketId"] == socketId || this.users[i]["name"] == socketId)
    {
      return i;
    }
  }
  return null;
}

var singewing = new Singewing();

singewing.ping();
setInterval(function () {singewing.ping()}, 30000);
