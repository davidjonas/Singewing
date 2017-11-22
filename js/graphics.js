var radius;

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
  singewing.beat();
  singewing.users[singewing.findUser(singewing.name)]["beat"] = true;
}

function windowResized(){
    resizeCanvas($("#graphics").width(), $("#graphics").height());
    radiuses = [width/4, height/4];
    radius = min(radiuses);
}
