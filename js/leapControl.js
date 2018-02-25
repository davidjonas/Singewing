

var LeapControl = function ()
{
  this.numActiveHands = 0;
  this.connected = false;
  this.handsElements = [];
  this.hands = [];
  this.smoothing = 5;
  this.peakDetectionSamples = 100;
  this.frames = [];
  this.current_acceleration = [];
  this.velocityPeakHandlers = [];
  this.accelerationPeakHandlers = [];
  this.connectHandlers = [];
  this.threshold = 1.5;
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
  //console.log("peak");
  audio.click(audio.context.currentTime,4000);
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

LeapControl.prototype.updateHandElements = function (id, hand)
{
  if(!this.handsElements[id])
  {
    this.handsElements[id] = $('<div class="hand"></div>');
    $("body").append(this.handsElements[id]);
  }

  var x = map(hand.palmPosition[0], -300, 300, 0, width);
  var y = map(hand.palmPosition[1], 50, 350, height, 0);

  $(this.handsElements[id]).css({
      'left': x,
      'top': y,
      });
};

LeapControl.prototype.getSpeed = function (id)
{
  if(this.hands[id] && this.hands[id].speedBuffer.length > 0)
  {
    return this.hands[id].speedBuffer[this.hands[id].speedBuffer.length - 1];
  }
  else {
    return 0;
  }
}

LeapControl.prototype.getAcceleration = function (id)
{
  if(this.hands[id] && this.hands[id].accBuffer.length > 0)
  {
    return this.hands[id].accBuffer[this.hands[id].accBuffer.length - 1];
  }
  else {
    return 0;
  }
}

LeapControl.prototype.updateHand = function (frame, h) {
  var id = frame.hands[h].id;

  if(!this.hands[id])
  {
    this.hands[id] = frame.hands[h];
    this.hands[id].speedBuffer = [];
    this.hands[id].accBuffer = [];
    this.hands[id].accPeaking = false;
    this.hands[id].speedPeaking = false;
  }

  //Calculate the speed as the magnitude of the velocity.
  var speed = Math.sqrt(this.hands[id].palmVelocity[0] * this.hands[id].palmVelocity[0] + this.hands[id].palmVelocity[1] * this.hands[id].palmVelocity[1] + this.hands[id].palmVelocity[2] * this.hands[id].palmVelocity[2]); ;

  //calculate acceleration from current speed and last speed
  var acc = 0;
  var count = 0;
  if(this.hands[id].speedBuffer.length > 0)
  {
    acc = speed - this.hands[id].speedBuffer[this.hands[id].speedBuffer.length -1];
    count++;
  }

  //smoothing acceleration
  for(var i=1; i<this.smoothing-1; i++)
  {
    if(this.hands[id].speedBuffer.length - i > 0 && this.hands[id].speedBuffer.length - i-1 >=0)
    {
      acc += this.hands[id].speedBuffer[this.hands[id].speedBuffer.length - i] - this.hands[id].speedBuffer[this.hands[id].speedBuffer.length - i-1];
      count++;
    }
  }

  acc /= count;

  //Save speed to buffer and shift if necessary.
  this.hands[id].speedBuffer.push(speed);
  if(this.hands[id].speedBuffer.length > this.peakDetectionSamples)
  {
    this.hands[id].speedBuffer.shift();
  }
  //Save acceleration to buffer and shift if necessary.
  this.hands[id].accBuffer.push(acc);
  if(this.hands[id].accBuffer.length > this.peakDetectionSamples)
  {
    this.hands[id].accBuffer.shift();
  }

  //Copy all the original attributes of the Leap hand to our extended hand
  var keys = Object.keys(frame.hands[h]);
  for(var i=0; i<keys.length; i++)
  {
    this.hands[id][keys[i]] = frame.hands[h][keys[i]];
  }
}

LeapControl.prototype.detectPeaks = function (id)
{
  if(this.hands[id])
  {

    //Mean and standard deviation
    var meanSpeed = 0;
    var sdSpeed = 0;
    var meanAcc = 0;
    var sdAcc = 0;

    //====================speed====================
    //calculating mean
    for(var i=0; i<this.hands[id].speedBuffer.length; i++)
    {
      meanSpeed += this.hands[id].speedBuffer[i];
    }
    meanSpeed /= this.hands[id].speedBuffer.length;

    //calculating standard deviation
    for(var i=0; i<this.hands[id].speedBuffer.length; i++)
    {
      var diff = Math.abs(meanSpeed - this.hands[id].speedBuffer[i])
      sdSpeed += diff * diff;
    }
    sdSpeed /= Math.sqrt(this.hands[id].speedBuffer.length);

    //check latest value for peak
    if(this.hands[id].speedBuffer[this.hands[id].speedBuffer.length-1] > meanSpeed + this.threshold * sdSpeed)
    {
      //this.velocityPeakEvent(this.hands[id].speedBuffer[this.hands[id].speedBuffer.length-1]);
    }

    //====================Acceleration====================
    //calculating mean
    for(var i=0; i<this.hands[id].accBuffer.length; i++)
    {
      meanAcc += this.hands[id].accBuffer[i];
    }
    meanAcc /= this.hands[id].accBuffer.length;

    DEBUGValue = meanAcc;

    //calculating standard deviation
    for(var i=0; i<this.hands[id].accBuffer.length; i++)
    {
      var diff = meanAcc - this.hands[id].accBuffer[i];
      sdAcc += diff * diff;
    }
    sdAcc /= this.hands[id].accBuffer.length;
    sdAcc = Math.sqrt(sdAcc);

    DEBUGdeviation = this.threshold * sdAcc;

    //check latest value for peak
    if(this.hands[id].accBuffer[this.hands[id].accBuffer.length-1] > meanAcc + this.threshold * sdAcc)
    {
      if(!this.hands[id].accPeaking)
      {
        this.accelerationPeakEvent(this.hands[id].accBuffer[this.hands[id].accBuffer.length-1]);
        this.hands[id].accPeaking = true;
      }
    }
    else {
      this.hands[id].accPeaking = false;
    }
  }
}

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

  this.numActiveHands = frame.hands.length;

  for(var i=0; i<frame.hands.length; i++)
  {
    this.updateHandElements(i, frame.hands[i]);
    this.updateHand(frame, i);
    this.detectPeaks(frame.hands[i].id);
  }

  for(var i=0; i<this.handsElements.length; i++)
  {
    if(!frame.hands[i])
    {
      $(this.handsElements[i]).remove();
      this.handsElements[i] = null;
    }
  }
};

var leapControl = new LeapControl();

Leap.loop(function(frame){
  leapControl.update(frame);
});
