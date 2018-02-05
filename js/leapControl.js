

LeapControl = function ()
{
  this.numHands = 0;
  this.connected = false;
  this.hands = [];
}

LeapControl.prototype.onConnect = function ()
{

}

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
}

var leapControl = new LeapControl();

Leap.loop(function(frame){
  if(!leapControl.connected)
  {
    leapControl.connected = true;
    console.log("LeapMotion detected");
  }
  leapControl.numHands = frame.hands.length;

  for(var i=0; i<frame.hands.length; i++)
  {
    leapControl.updateHand(i, frame.hands[i]);
  }

  for(var i=0; i<leapControl.hands.length; i++)
  {
    if(!frame.hands[i])
    {
      $(leapControl.hands[i]).remove();
      leapControl.hands[i] = null;
    }
  }
});
