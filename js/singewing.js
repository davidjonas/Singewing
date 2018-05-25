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
  this.matches = [];
  this.selectedSound = 0;
  this.selectedColor = 0;
  this.currentPhase = 0;

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
      self.updateUserList();
    }
  });

  //RX - User disconnected
  this.socket.on("userQuit", function (user){
    if(self.registered)
    {
      log(user["name"] + " Left.");
      audio.stopClick(self.findUser(user["name"]));
    }
  });

  //RX - registration error
  this.socket.on("registrationError", function (msg) {
    log(msg);
    registrationError();
  });

  //RX - updateUserList
  this.socket.on("updateUserList", function (users) {
    if(self.registered)
    {
      self.users = users;

      for(var i=0; i<self.users.length; i++)
      {
        if(self.users[i]["name"] != self.name && self.users[i]["BPM"] > 0)
        {
          if(audio.layers[i])
          {
            //audio.setTempo(i, self.users[i]["BPM"]);
          }
          else {
            //audio.startClick(i, 100, self.users[i]["BPM"]);
            //audio.startSound(i, self.users[i]["sound"], self.users[i]["BPM"]);
          }
        }
      }
    }
  });

  //RX - Beat
  this.socket.on("beat", function(args)
  {
    if(self.registered)
    {
      var index = self.findUser(args["socketId"]);
      self.users[index]["beat"] = true;
      self.users[index]["BPM"] = args["BPM"];

      audio.sounds[self.users[index]["sound"]].play();

      /* if(audio.layers[index])
      {
        //console.log("Setting tempo to " + args["BPM"]);
        audio.setTempo(index, args["BPM"]);
      }
      else {
        if(args["BPM"] > 0)
        {
          //audio.startClick(index, 100, args["BPM"]);
          //audio.startSound(index, 1, args["BPM"]);
          audio.startSound(index, self.users[index]["sound"], args["BPM"], self.users[index]["pattern"]);
        }
      } */
    }
  });

  //RX - match
  this.socket.on("match", function(args)
  {
    self.matches = args;
  });

  //RX - phase
  this.socket.on("phase", function(args)
  {
    //self.clearLayers();
    //self.currentPhase = args["number"];
    if(args["number"] == 1)
    {
      BPMAvg = args["data"]["BPM"];
      self.BPM = args["data"]["BPM"];
      //audio.beet.tempo = self.BPM;
      //var el = $('<div id="pattern"><input type="text" id="patternInput" value="'+self.users[self.findUser(self.name)]["pattern"]+'"/> <input id="patternApplyButton" type="button" value="apply" /></div>');
      //$(el).css("margin-top", (100 + 20 * self.users.length) + "px" );
      //$("#graphics").append(el);
      //$("#patternApplyButton").click(function (){
      //          self.setPattern($("#patternInput").val());
      //});

      score();
    }
  });

  //RX - setPattern
  this.socket.on("setPattern", function (args){
    var index = self.findUser(args["socketId"]);
    self.users[index]["pattern"] = args["pattern"];
    audio.startSound(index, self.users[index]["sound"], self.users[index]["BPM"], self.users[index]["pattern"]);
  });

  //RX - leap
  this.socket.on("leap", function (args){
    if(self.registered)
    {
      var index = args['u'];
      self.users[index]['p'] = args['p'];
    }
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
  this.socket.emit("register", {"name":this.name, "sound":this.selectedSound, "color":this.selectedColor});
};

//TX - Get/Update user list
Singewing.prototype.updateUserList = function () {
  this.socket.emit("updateUserList");
};

//TX - beat
Singewing.prototype.beat = function(volume)
{
  if(this.registered)
  {
    var correctedTime = new Date().getTime() + this.offset;

    if(volume)
    {
      audio.sounds[this.selectedSound].volume = volume;
    }
    audio.sounds[this.selectedSound].play();
    if(volume)
    {
      audio.sounds[this.selectedSound].volume = 1;
    }

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

    this.socket.emit("beat", {"time":correctedTime, "BPM": this.BPM});
  }
}

//TX - setPattern
Singewing.prototype.setPattern = function (pattern)
{
  var index = this.findUser(this.name);
  this.users[index]["pattern"] = pattern;
  if(audio.layers[index]) {
    audio.updateLayerPattern(index, pattern);
  }
  else {
    audio.startSound(index, this.selectedSound, this.users[index]["BPM"], pattern);
  }
  this.socket.emit("setPattern", pattern);
}

Singewing.prototype.findMatches = function () {
  return this.matches;
}

Singewing.prototype.clearLayers = function () {
  for (var i=0; i<audio.layers.length; i++)
  {
    audio.stopSound(i);
  }
}

Singewing.prototype.averageBPM = function ()
{
  var avg = 0;
  var count = 0;
  for(var i=0; i<this.users.length; i++)
  {
    if(this.users[i]["BPM"]>0)
    {
      avg += this.users[i]["BPM"];
      count++;
    }
  }

  if(count > 0)
  {
    avg /= count;
  }

  return int(avg);
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

leapControl.onAccelerationPeak(function (value) {
  if(singewing.registered)
  {
    if(singewing.currentPhase == 0)
    {

      singewing.beat(map(value, 0, 250, 0, 1));
      singewing.users[singewing.findUser(singewing.name)]["beat"] = true;
      beats++;
    }
  }
});
