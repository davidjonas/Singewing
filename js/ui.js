
$(function () {
  $("#intro").fadeTo(500, 1);

  //connect button event
  $("#introForm").submit(function (e) {
    e.preventDefault();
    singewing.register();
    $("#intro").fadeTo(500, 0, function(){
      $("#intro").hide();
      $("#main").fadeTo(500, 1);
    });
  });
  $("#name").focus().click();

  //debug console events
  $("#debug").click(function(){
    $("#debug").toggleClass("closed");
  });
});
