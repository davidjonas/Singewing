var vel_buffers = [];
var acc_buffers = [];
var DEBUGmax = 100;
var DEBUGmin = 0;
var DEBUGValue = 100;
var DEBUGdeviation = 100;

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

  for(var h=0; h<Object.keys(leapControl.hands).length; h++)
  {
    var id = Object.keys(leapControl.hands)[h];
    //paintBuffer(vel_buffers[id], color('rgb(255,0,0)'));
    paintBuffer(acc_buffers[id], color('rgb(0,0,255)'));
  }

  var mean = map(DEBUGValue, DEBUGmin, DEBUGmax, height-50, 50);
  var devMax = map(DEBUGValue + DEBUGdeviation, DEBUGmin, DEBUGmax, height-50, 50);
  var devMin = map(DEBUGValue - DEBUGdeviation, DEBUGmin, DEBUGmax, height-50, 50);

  stroke(0,255,0);
  line(0, mean, width, mean);
  stroke(50,255,50);
  line(0, devMax, width, devMax);
  line(0, devMin, width, devMin);
}

function collectData() {
  //Push or Push-Pop data into buffers.

  for(var h=0; h<Object.keys(leapControl.hands).length; h++)
  {
    var id = Object.keys(leapControl.hands)[h];

    var vel = leapControl.getSpeed(id);
    var acc = leapControl.getAcceleration(id);

    if(!vel_buffers[id])
    {
      vel_buffers[id] = [];
    }
    if(!acc_buffers[id])
    {
      acc_buffers[id] = [];
    }

    vel_buffers[id].push(vel);
    acc_buffers[id].push(acc);

    if(vel_buffers[id].length > width)
    {
      vel_buffers[id].shift();
    }

    if(acc_buffers[id].length > width)
    {
      acc_buffers[id].shift();
    }
  }
}

function paintBuffer(buff, col) {
  noFill();
  stroke(col);
  strokeWeight(2);

  var max = arrayMax(buff);
  var min = arrayMin(buff);
  DEBUGmin = min;
  DEBUGmax = max;

  if(min == max){
    min = -100;
    max = 100;
  }

  for(var i=1; i<buff.length; i++)
  {
    var value = map(buff[i], min, max, height-50, 50);
    var last_value = map(buff[i-1], min, max, height-50, 50);
    line(i, value, i-1, last_value);
    //point(i,value);
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
