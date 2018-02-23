

var LeapControl = function ()
{
  this.numHands = 0;
  this.connected = false;
  this.hands = [];
  this.smoothing = 5;
  this.frames = [];
  this.current_velocity = [];
  this.current_acceleration = [];
  this.velocityPeakHandlers = [];
  this.accelerationPeakHandlers = [];
  this.connectHandlers = [];
  this.threshold = 0;
  this.last_acceleration_magnitude = [];
};

LeapControl.prototype.onVelocityPeak = function (callback)
{
  this.velocityPeakHandlers.push(callback);
};

LeapControl.prototype.onAccelerationPeak = function (callback)
{
  this.accelerationPeakHandlers.push(callback);
};

LeapControl.prototype.onConnect = function (callback)
{
  this.connectHandlers.push(callback);
};

LeapControl.prototype.connectedEvent = function ()
{
  for(var i=0; i<this.connectHandlers.length; i++)
  {
    connectHandlers[i]();
  }
};

LeapControl.prototype.accelerationPeakEvent = function (value)
{
  console.log("peak");
  for(var i=0; i<this.accelerationPeakHandlers.length; i++)
  {
    accelerationPeakHandlers[i](value);
  }
};

LeapControl.prototype.velocityPeakEvent = function ()
{
  for(var i=0; i<this.velocityPeakHandlers.length; i++)
  {
    velocityPeakHandlers[i](value);
  }
};

LeapControl.prototype.updateHand = function (id, hand)
{
  if(!this.hands[id])
  {
    this.hands[id] = $('<div class="hand"></div>');
    $("body").append(this.hands[id]);
  }

  var x = map(hand.palmPosition[0], -300, 300, 0, width);
  var y = map(hand.palmPosition[1], 50, 350, height, 0);

  $(this.hands[id]).css({
      'left': x,
      'top': y,
      });
};

LeapControl.prototype.calculateValues = function () {
  for(var h=0; h<this.hands.length; h++)
  {
    if(!this.current_velocity[h])
    {
      this.current_velocity[h] = [0,0,0];
    }
    if(!this.current_acceleration[h])
    {
      this.current_acceleration[h] = [0,0,0];
    }


    var last_velocity = this.current_velocity[h];
    this.current_velocity[h] = [0,0,0];

    for(var i=1; i<this.frames.length; i++)
    {
      if(this.frames[i].hands[h] && this.frames[i-1].hands[h])
      {
        var timeDIff = this.frames[i].timestamp - this.frames[i-1].timestamp;
        this.current_velocity[h][0] += (this.frames[i].hands[h].palmPosition[0] - this.frames[i-1].hands[h].palmPosition[0])/timeDIff;
        this.current_velocity[h][1] += (this.frames[i].hands[h].palmPosition[1] - this.frames[i-1].hands[h].palmPosition[1])/timeDIff;
        this.current_velocity[h][2] += (this.frames[i].hands[h].palmPosition[2] - this.frames[i-1].hands[h].palmPosition[2])/timeDIff;
      }
    }

    this.current_velocity[h][0] /= this.frames.length;
    this.current_velocity[h][1] /= this.frames.length;
    this.current_velocity[h][2] /= this.frames.length;

    if(this.frames.length >= 2)
    {
      this.current_acceleration[h][0] = (this.current_velocity[h][0] - last_velocity[0]);
      this.current_acceleration[h][1] = (this.current_velocity[h][1] - last_velocity[1]);
      this.current_acceleration[h][2] = (this.current_velocity[h][2] - last_velocity[2]);
    }
    else {
      this.current_acceleration[h] = [0,0,0];
    }

    accelerationMagnitude = sqrt(this.current_acceleration[h][0]*this.current_acceleration[h][0] + this.current_acceleration[h][1]*this.current_acceleration[h][1] + this.current_acceleration[h][2]*this.current_acceleration[h][2]);

    if(accelerationMagnitude - this.last_acceleration_magnitude[h] > this.threshold)
    {
      this.accelerationPeakEvent();
      this.threshold = accelerationMagnitude - this.last_acceleration_magnitude[h];
    }
    else{
      this.threshold *= 0.99;
    }

    this.last_acceleration_magnitude[h] = accelerationMagnitude;
  }
};

LeapControl.prototype.update = function (frame) {
  if(!leapControl.connected)
  {
    this.connected = true;
    this.connectedEvent();
    console.log("LeapMotion detected");
  }

  this.frames.push(frame);
  if(this.frames.length > this.smoothing)
  {
    this.frames.shift();
  }

  this.numHands = frame.hands.length;

  for(var i=0; i<frame.hands.length; i++)
  {
    this.updateHand(i, frame.hands[i]);
  }

  for(var i=0; i<this.hands.length; i++)
  {
    if(!frame.hands[i])
    {
      $(this.hands[i]).remove();
      this.hands[i] = null;
    }
  }

  this.calculateValues();
};

var leapControl = new LeapControl();

Leap.loop(function(frame){
  leapControl.update(frame);
});
