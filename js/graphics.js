var radius;

function setup()
{
  cnv = createCanvas($("#graphics").width(), $("#graphics").height());
  cnv.parent('graphics');
  radius = 300;
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
    fill(singewing.users[i]["color"][0],singewing.users[i]["color"][1],singewing.users[i]["color"][2]);
    console.log(xPos, yPos);
    ellipse(xPos,yPos,100,100);
  }

}

function windowResized(){
    resizeCanvas($("#graphics").width(), $("#graphics").height());
}
