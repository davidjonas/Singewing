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
  this.beats = [];
  this.BPM = 0;
  this.smoothing = 20;

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

  //RX - Beat
  this.socket.on("beat", function(args)
  {
    var index = self.findUser(args["socketId"]);
    self.users[index]["beat"] = true;
    self.users[index]["BPM"] = args["BPM"];
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
  if(this.registered)
  {
    var correctedTime = new Date().getTime() + this.offset;
    this.socket.emit("beat", {"time":correctedTime, "BPM": this.BPM});

    //clear if current beat interval bigger than 2 seconds;
    if(this.beats.length > 0 && (correctedTime - this.beats[this.beats.length-1]) > 2000)
    {
      this.beats = [];
    }
    this.beats.push(correctedTime);
    if(this.beats.length == this.smoothing)
    {
      this.beats.shift();
    }

    if(this.beats.length>2)
    {
      this.BPM = 0;
      for(var i=1; i<this.beats.length; i++)
      {
        this.BPM += (this.beats[i] - this.beats[i-1]);
      }

      this.BPM = this.BPM/this.beats.length-1;

      this.BPM = Math.round((1000/this.BPM)*60);

      this.users[this.findUser(this.name)]["BPM"] = this.BPM;
    }
  }
}

Singewing.prototype.findMatches = function (index) {
  var result = [];

  if(this.users[index]["BPM"] === 0)
  {
    return result;
  }

  for (var i=0; i<this.users.length; i++)
  {
    if(i != index)
    {
      if(this.users[i]["BPM"] === this.users[index]["BPM"])
      {
        result.push(i);
      }
    }
  }
  return result;
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
setInterval(function () {singewing.ping()}, 5000);
