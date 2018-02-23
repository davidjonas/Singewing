var vel_buffers = [];
var acc_buffers = [];

function arrayMin(arr) {
  var len = arr.length, min = Infinity;
  while (len--) {
    if (arr[len] < min) {
      min = arr[len];
    }
  }
  return min;
};

function arrayMax(arr) {
  var len = arr.length, max = -Infinity;
  while (len--) {
    if (arr[len] > max) {
      max = arr[len];
    }
  }
  return max;
};

function setup() {
  cnv = createCanvas($("#graphics").width(), $("#graphics").height());
  cnv.parent('graphics');
  //colorMode(HSL);
}

function draw() {
  clear();
  collectData();

  for(var h=0; h<leapControl.hands.length; h++)
  {
    paintBuffer(vel_buffers[h], color('rgb(255,0,0)'));
    paintBuffer(acc_buffers[h], color('rgb(0,0,255)'));
  }
}

function collectData() {
  //Push or Push-Pop data into buffers.

  for(var h=0; h<leapControl.hands.length; h++)
  {
    var vel = sqrt(leapControl.current_velocity[h][0]*leapControl.current_velocity[h][0] + leapControl.current_velocity[h][1]*leapControl.current_velocity[h][1] + leapControl.current_velocity[h][2]*leapControl.current_velocity[h][2]);
    var acc = sqrt(leapControl.current_acceleration[h][0]*leapControl.current_acceleration[h][0] + leapControl.current_acceleration[h][1]*leapControl.current_acceleration[h][1] + leapControl.current_acceleration[h][2]*leapControl.current_acceleration[h][2]);

    if(!vel_buffers[h])
    {
      vel_buffers[h] = [];
    }
    if(!acc_buffers[h])
    {
      acc_buffers[h] = [];
    }

    vel_buffers[h].push(vel);
    acc_buffers[h].push(acc);

    if(vel_buffers[h].length > width)
    {
      vel_buffers[h].shift();
    }

    if(acc_buffers[h].length > width)
    {
      acc_buffers[h].shift();
    }
  }
}

function paintBuffer(buff, col) {
  noFill();
  stroke(col);
  strokeWeight(2);

  var max = arrayMax(buff);
  var min = arrayMin(buff);

  if(min == max){
    min = -100;
    max = 100;
  }

  for(var i=1; i<buff.length; i++)
  {
    var value = map(buff[i], min, max, height-50, 50);
    var last_value = map(buff[i-1], min, max, height-50, 50);
    line(i, value, i-1, last_value);
  }
}

function windowResized(){
    resizeCanvas($("#graphics").width(), $("#graphics").height());
    for(var i=0; i<vel_buffers.length; i++)
    {
      if(vel_buffers[i].length > width)
      {
        vel_buffers[i].splice(0, vel_buffers[i].length-width);
      }
    }

    for(var i=0; i<acc_buffers.length; i++)
    {
      if(acc_buffers[i].length > width)
      {
        acc_buffers[i].splice(0, acc_buffers[i].length-width);
      }
    }
}
