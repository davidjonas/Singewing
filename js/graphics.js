var radius;

window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function setup()
{
  cnv = createCanvas($("#graphics").width(), $("#graphics").height());
  cnv.parent('graphics');
  radiuses = [width/4, height/4];
  radius = min(radiuses);
  textAlign(CENTER, CENTER);
  colorMode(HSB, 255);
}

function draw()
{
  clear();
  fill("#d35796");
  noStroke();

  for(var i=0; i<singewing.users.length; i++)
  {
    var angle = map(i, 0, singewing.users.length, 0, TWO_PI);
    var xPos = cos(angle) * radius + width/2;
    var yPos = sin(angle) * radius + height/2;

    var pulse = sin(frameCount/100 + i) * 10;

    noStroke();

    var alpha = 30;

    if(singewing.users[i]["beat"])
    {
      alpha = 255;
      if(singewing.users[i]["beat"])
      {
        singewing.users[i]["beat"]=false;
      }
    }

    fill(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2], alpha);

    if(width > 1000)
    {
      ellipse(xPos,yPos,width*0.1 + pulse,width*0.1 + pulse);
      ellipse(xPos,yPos,width*0.08 + pulse,width*0.08 + pulse);
      ellipse(xPos,yPos,width*0.06 + pulse,width*0.06 + pulse);
      ellipse(xPos,yPos,width*0.02 + pulse,width*0.02 + pulse);

      if(singewing.users[i]["name"] == singewing.name)
      {
        noFill();
        stroke(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2], 100);
        strokeWeight(5);
        ellipse(xPos,yPos,width*0.1,width*0.1);
        strokeWeight(1);
        ellipse(xPos,yPos,width*0.1+9,width*0.1+9);
      }

      fill(255);
      noStroke();
      text(singewing.users[i]["BPM"] + " BPM",xPos+110, yPos);
    }
    else {
      ellipse(xPos,yPos,width*0.35 + pulse,width*0.35 + pulse);
      ellipse(xPos,yPos,width*0.25 + pulse,width*0.25 + pulse);
      ellipse(xPos,yPos,width*0.10 + pulse,width*0.10 + pulse);
      ellipse(xPos,yPos,width*0.05 + pulse,width*0.05 + pulse);

      if(singewing.users[i]["name"] == singewing.name)
      {
        noFill();
        stroke(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2], 100);
        strokeWeight(5);
        ellipse(xPos,yPos,width*0.3,width*0.3);
        strokeWeight(1);
        ellipse(xPos,yPos,width*0.3+9,width*0.3+9);
      }

      fill(255);
      noStroke();
      text(singewing.users[i]["BPM"] + " BPM",xPos, yPos+20);
    }

    fill(255);
    noStroke();
    text(singewing.users[i]["name"],xPos, yPos);
  }

  textAlign(LEFT, TOP);
  text("Communication delay: " + singewing.delay + "ms",10,10);
  text("Clock difference corrected: " + singewing.offset + "ms",10,30);
  textAlign(CENTER, CENTER);
}

function mouseClicked()
{
  if(!window.mobileAndTabletcheck())
  {
    singewing.beat();
    singewing.users[singewing.findUser(singewing.name)]["beat"] = true;
  }
}

function touchStarted()
{
  if(window.mobileAndTabletcheck())
  {
    singewing.beat();
    singewing.users[singewing.findUser(singewing.name)]["beat"] = true;
  }
}

function windowResized(){
    resizeCanvas($("#graphics").width(), $("#graphics").height());
    radiuses = [width/4, height/4];
    radius = min(radiuses);
}
