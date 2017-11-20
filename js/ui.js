
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

$(function () {
  $("#intro").fadeTo(500, 1);

  //connect button event
  $("#introForm").submit(function (e) {
    e.preventDefault();
    singewing.register();
  });
  $("#name").focus().click();

  //debug console events
  $("#debug").click(function(){
    $("#debug").toggleClass("closed");
  });
});
