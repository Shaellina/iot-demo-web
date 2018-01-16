 $(function() {
  $('.switch').click(function() {
   if( $(".switch").hasClass("switchLightOff") ) {
    $(".switch").removeClass("switchLightOff"),
    $(".switch").addClass("switchLightOn"),
    $("#Wrapper").removeClass("dark"),
    $(".hole").removeClass("holeLightOff"),
    $(".hole").addClass("holeLightOn"),
    $(".handle").removeClass("handleLightOff"),  
    $(".handle").addClass("handleLightOn"),
    $(".sk").addClass("on"),
    $(".handleTop").removeClass("handleTopLightOff"),  
    $(".handleTop").addClass("handleTopLightOn"),
    $(".handleBottom").removeClass("handleBottomLightOff"),
    $(".handleBottom").addClass("handleBottomLightOn"); 
	var url = '/sendtoplug';
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url);
	xhr.setRequestHeader('Content-Type', 'text/plain');
	xhr.send("ON");
	showMessage("송신 본문의 content-type : " + "text/plain");
	showMessage("송신 본문 내용  : " + "1");
   }
   else
   {
		var url = '/sendtoplug';
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.setRequestHeader('Content-Type', 'text/plain');
		xhr.send("OFF");
		showMessage("송신 본문의 content-type : " + "text/plain");
		showMessage("송신 본문 내용  : " + "0");
    $(".switch").addClass("switchLightOff"),
    $("#Wrapper").addClass("dark"),
    $(".hole").removeClass("holeLightOn"),   
    $(".hole").addClass("holeLightOff"),  
    $(".handle").removeClass("handleLightOn"),  
    $(".handle").addClass("handleLightOff"), 
    $(".sk").removeClass("on"),  
    $(".handleTop").removeClass("handleTopLightOn"),  
    $(".handleTop").addClass("handleTopLightOff"),
      $(".handleBottom").removeClass("handleBottomLightOn"),
    $(".handleBottom").addClass("handleBottomLightOff");
   }
   });
  });
