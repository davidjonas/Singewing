
var points = 0;

var registrationSuccess = function () {
  $("#intro").fadeTo(500, 0, function(){
    $("#intro").hide();
    $("#main").fadeTo(500, 1);
  });
}

var registrationError = function () {
  $("#registrationError").show();
  $("#name").val("");
}

var score = function () {
  points++;
  pointTextSize = 80;
}

$(function () {
  $("#intro").fadeTo(500, 1);

  //connect button event
  $("#introForm").submit(function (e) {
    e.preventDefault();
    singewing.register();
    audio.context.resume();
  });
  $("#name").focus().click();

  //debug console events
  $("#debug").click(function(){
    $("#debug").toggleClass("closed");
  });

  var slider = document.getElementById("myRange");
  slider.oninput = function() {
      trailSize = this.value;
  }
});
