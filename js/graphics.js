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
    fill(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2], 30);
    ellipse(xPos,yPos,width*0.1 + pulse,width*0.1 + pulse);
    ellipse(xPos,yPos,width*0.08 + pulse,width*0.08 + pulse);
    ellipse(xPos,yPos,width*0.06 + pulse,width*0.06 + pulse);
    ellipse(xPos,yPos,width*0.02 + pulse,width*0.02 + pulse);

    fill(255);
    text(singewing.users[i]["name"],xPos, yPos);

    if(singewing.users[i]["name"] == singewing.name)
    {
      noFill();
      stroke(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2], 100);
      strokeWeight(5);
      ellipse(xPos,yPos,width*0.1,width*0.1);
    }
  }
}

function windowResized(){
    resizeCanvas($("#graphics").width(), $("#graphics").height());
    radiuses = [width/4, height/4];
    radius = min(radiuses);
}
