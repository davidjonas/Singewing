var radius;
var animation;
var animations = [];
var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


var beats = 0;
var BPMAvg = 0;

var trailSize = 40;
var localTrails = [];
var userTrails = [];

var pointTextSize = 40;

function iOS() {

  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ];

  if (!!navigator.platform) {
    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()){ return true; }
    }
  }

  return false;
}

window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

var phases = [
  //+++++++++++++++++++++++ Phase 0 -- localTrails +++++++++++++++++++++++
  function (){
    if(singewing.registered)
    {
      textAlign(CENTER, CENTER);
      textSize(width*0.03);
      fill(255, 100);
      text("Wave your hand until you find your tempo.",width/2,height*0.1);
      textSize(width*0.1);
      text(singewing.BPM,width/2,height*0.2);

      textSize(width*0.02);
      if(singewing.BPM < singewing.averageBPM())
      {
        text('faster',width/2,height*0.35);
      }
      if(singewing.BPM > singewing.averageBPM()) {
        text('slower',width/2,height*0.35);
      }

      for(var i=0; i<leapControl.hands.length; i++)
      {
        if(leapControl.hands[i] && leapControl.hands[i].active)
        {
          var x = map(leapControl.hands[i].palmPosition[0], -300, 300, 0, width);
          var y = map(leapControl.hands[i].palmPosition[1], 50, 350, height, 0);

          singewing.socket.emit('leap', [leapControl.hands[i].palmPosition[0], leapControl.hands[i].palmPosition[1]]);

          if(!localTrails[i])
          {
            localTrails[i] = [];
          }

          localTrails[i].push([x, y]);
          if(localTrails[i].length >= trailSize)
          {
            localTrails[i].shift();
          }

          for(var p=0; p<localTrails[i].length; p++)
          {
            var thickness = map(p, 0, localTrails[i].length, 5, 10);
            var alpha = map(p, 0, localTrails[i].length, 50, 180);
            if(p>0)
            {
              stroke(singewing.selectedColor, singewing.users[0].color[1], singewing.users[0].color[2], alpha);
              strokeCap(SQUARE);
              if(!singewing.users[singewing.findUser(singewing.name)]["beat"])
              {
                strokeWeight(thickness);
              }
              else{
                strokeWeight(thickness*2);
                singewing.users[singewing.findUser(singewing.name)]["beat"] = false;
              }
              line(localTrails[i][p][0], localTrails[i][p][1], localTrails[i][p-1][0], localTrails[i][p-1][1]);
              strokeWeight(thickness/2);
              line(localTrails[i][p][0], localTrails[i][p][1], localTrails[i][p-1][0], localTrails[i][p-1][1]);
            }

            if(p == localTrails[i].length-1 && singewing.users[0])
            {
              fill(singewing.selectedColor, singewing.users[0].color[1], singewing.users[0].color[2], alpha);
              noStroke();
              ellipse(localTrails[i][p][0], localTrails[i][p][1], thickness, thickness);
            }
          }
        }
        else{
          if(localTrails[i] && localTrails[i].length > 0)
          {
            localTrails[i] = [];
          }
        }
      }

      for(var i=0; i<singewing.users.length; i++)
      {
        var alpha = 7;
        if(singewing.users[i]["name"] === singewing.name)
        {
          alpha = 50;
        }

        if(singewing.users[i]['p'] && (singewing.users[i]['p'][0] != 0 || singewing.users[i]['p'][1] != 0) )
        {
          var x = map(singewing.users[i]['p'][0], -300, 300, 0, width);
          var y = map(singewing.users[i]['p'][1], 50, 350, height, 0);

          if(!userTrails[i])
          {
            userTrails[i] = [];
          }

          userTrails[i].push([x, y]);
          if(userTrails[i].length >= trailSize)
          {
            userTrails[i].shift();
          }

          for(var p=0; p<userTrails[i].length; p++)
          {
            var thickness = map(p, 0, userTrails[i].length, 5, 10);
            var alpha = map(p, 0, userTrails[i].length, 50, 180);
            if(p>0)
            {
              stroke(singewing.users[i].color[0], singewing.users[i].color[1], singewing.users[i].color[2], alpha);
              strokeCap(SQUARE);
              if(!singewing.users[singewing.findUser(singewing.name)]["beat"])
              {
                strokeWeight(thickness);
              }
              else{
                strokeWeight(thickness*2);
                singewing.users[singewing.findUser(singewing.name)]["beat"] = false;
              }
              line(userTrails[i][p][0], userTrails[i][p][1], userTrails[i][p-1][0], userTrails[i][p-1][1]);
              strokeWeight(thickness/2);
              line(userTrails[i][p][0], userTrails[i][p][1], userTrails[i][p-1][0], userTrails[i][p-1][1]);
            }

            if(p == userTrails[i].length-1 && singewing.users[0])
            {
              fill(singewing.users[i].color[0], singewing.users[i].color[1], singewing.users[i].color[2], alpha);
              noStroke();
              ellipse(userTrails[i][p][0], userTrails[i][p][1], thickness, thickness);
            }
          }
        }

        drawUserLegend(i, alpha);

        drawPoints();
      }
      animation += 0.013;
    }
  },
  //+++++++++++++++++++++++ Phase 1 --  Matched tempos +++++++++++++++++++++++
  function (){

  },
];

function drawPoints()
{
  textAlign(LEFT, CENTER);
  fill(40,255, 255);
  textSize(pointTextSize);
  text(points,width - 100, 100);

  if(pointTextSize > 40)
  {
    pointTextSize--;
  }
}

function drawPattern(pattern, x, y, radius, hue, sat, bright) {
  var size = pattern.length;
  var offset = -HALF_PI;
  var step = TWO_PI / size;

  noFill();
  stroke(100,100,100);
  ellipse(x, y, radius*2, radius*2);

  var stepCount = 0;

  for(var angle=offset; angle<offset+TWO_PI; angle=angle+step)
  {
    if(pattern[stepCount] == '1')
    {
      fill(hue,sat,bright);
    }
    else {
      fill(0);
    }
    ellipse(x+cos(angle)*radius, y+sin(angle)*radius, 10, 10);

    stepCount++;
  }
}

function drawUserLegend(i, alpha)
{
  var numUsers = singewing.users.length;
  var posY = height*0.9;
  var posX = (i*width*0.8/numUsers) + width*0.2;

  noStroke();
  fill(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2], alpha+30);

  push();
    translate(posX, posY);
    rotate(radians(-90));
    for(var j=0; j<3; j++)
    {
      beginShape();
      for(var p=0; p<TWO_PI; p+=TWO_PI/8)
      {
        vertex(cos(p)*10 + (noise(p+animation*(j+1))-0.5)*20, sin(p)*10 + (noise(p+animation*(j+1))-0.5)*20);
      }
      endShape();
    }
    textAlign(LEFT, CENTER);
    textSize(height*0.03);
    text(singewing.users[i]["name"],25, -3);
  pop();
}

function drawWave(i, alpha, matched)
{
  var yPos = height/2;
  var noiseAmplitude = 30;

  if(matched) {
    noiseAmplitude = 60;
  }

  fill(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2], alpha);

  for(var t=0; t<5; t++)
  {
    beginShape();
    noiseDetail(6, 0.4);

    for(var j=0; j<50; j++)
    {
      var x = map(j, 0, 50, 0, width);
      var wave = cos(map(x, 0, width, 0, TWO_PI)+animations[i]) * noiseAmplitude + i;
      vertex(x, yPos + noise(j+animation*(t+1))*noiseAmplitude + wave);
    }

    for(var j=100; j>0; j--)
    {
      var x = map(j, 0, 100, 0, width);
      var wave = cos(map(x, 0, width, 0, TWO_PI)+animations[i]) * noiseAmplitude + i;
      vertex(x, yPos + noise(j+animation*(t+1))*noiseAmplitude + 10 + wave);
    }
    endShape();
  }
}

function preload() {
  myFont = loadFont('ScopeOne-Regular.ttf');
}

function setup()
{
  cnv = createCanvas($("#graphics").width(), $("#graphics").height());
  cnv.parent('graphics');
  radiuses = [width/4, height/4];
  radius = min(radiuses);
  animation = 0;
  textAlign(CENTER, CENTER);
  colorMode(HSB, 255);
  textFont(myFont);
  frameRate(24);

  for(var i=0; i < audio.sounds.length; i++)
  {
    //var angle = i*(TWO_PI/audio.sounds.length);
    //var left = (cos(angle)/2 + 0.5)*100;
    //var top = (sin(angle)/2 + 0.5)*100;

    var left = 100/audio.sounds.length * (i+0.5);
    var c = int(255/audio.sounds.length * i);
    var top = (sin(map(i, 0, audio.sounds.length-1, 0, -PI)) * 30);

    var el = $('<div class="soundButton" data-index="'+i+'">'+letters[i]+'</div>');
    var el2 = $('<div class="colorButton" data-index="'+c+'"></div>');

    $(el).click(soundChoice);
    $(el).css({"position": "absolute", "left": left + "%", "top":top + "px"});

    $(el2).click(colorChoice);
    $(el2).css({"position": "absolute", "left": left + "%", "top":top + "px", "background": "hsl("+(c*360/255)+",60%,50%)"});

    if(i == singewing.selectedSound)
    {
      $(el).addClass("selected");
    }
    if(c == singewing.selectedColor)
    {
      $(el2).addClass("selected");
    }

    $("#soundSelector").append(el);
    $("#colorSelector").append(el2);

  }
}

function soundChoice()
{
  var index = this.dataset.index;
  audio.sounds[index].play();
  singewing.selectedSound = index;
  $(".soundButton.selected").removeClass("selected");
  $(this).addClass("selected");
}

function colorChoice()
{
  var color = this.dataset.index;
  singewing.selectedColor = color;
  $(".colorButton.selected").removeClass("selected");
  $(this).addClass("selected");
}

function draw()
{
  clear();
  fill("#d35796");
  noStroke();

  phases[singewing.currentPhase]();

  //Debug
  // textAlign(LEFT, TOP);
  // textSize(10);
  // fill(255);
  // text("Communication delay: " + singewing.delay + "ms",10,10);
  // text("Clock difference corrected: " + singewing.offset + "ms",10,30);
  // text(beats + " beats detected.", 10, 50);
  // text(singewing.BPM + " BPM", 10, 70);

}

function mouseClicked()
{
    /* if(singewing.registered)
    {
      if(singewing.currentPhase == 0)
      {
        singewing.beat();
        singewing.users[singewing.findUser(singewing.name)]["beat"] = true;
        beats++;
      }
    } */
}

function touchStarted()
{
  if(singewing.registered)
  {
    if(singewing.currentPhase == 0)
    {
      singewing.beat();
      singewing.users[singewing.findUser(singewing.name)]["beat"] = true;
      beats++;
    }
  }
}

function windowResized(){
    resizeCanvas($("#graphics").width(), $("#graphics").height());
    radiuses = [width/4, height/4];
    radius = min(radiuses);
}
