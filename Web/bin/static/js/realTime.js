var hours = 0;
var mins = 0;
var seconds = 0;
var toDay = new Date();
var firstDate = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate());
var temperature_value = 0;

function InitDatas(){	
	var url = '/initialize';
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url);
	xhr.setRequestHeader('Content-Type', 'text/plain');
	xhr.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	Set_temp(this.responseText);	      
	    }
	};
	xhr.send("ON");
}
function Set_temp(arr){
	temperature_value = arr;
}
function showMessage(message) {
	var p = document.createElement('p');
	p.style.wordWrap = 'break-word';
	p.appendChild(document.createTextNode(message));
	$("#response").append(p);
	$("#response").scrollTop(10000000);
}

$(document).ready(function() {
	connect();
	InitDatas();
	$("#response").html("");
	$("#chartdiv").html("");
});

function connect() {

	var socket = new SockJS('/dashboard');

	stompClient = Stomp.over(socket);
	stompClient.connect({}, function(frame) {
		console.log('Connected: ' + frame);
		// graphStart();
		stompClient.subscribe('/topic/subscribe', function(message) {

			temperature_value = JSON.parse(JSON.parse(message.body).body);
			showMessage(new Date());
			
			var ct = JSON.parse(message.body).headers["content-type"];
			ct ? "" : ct = JSON.parse(message.body).headers["Content-Type"];
			showMessage("수신 본문의 content-type : " + ct);
			var ot = JSON.parse(message.body).headers["x-m2m-ot"];
			ot ? showMessage("수신 본문의 x-m2m-ot : " + ot) : "";
			showMessage("수신 본문 내용  : " + temperature_value);

		});
	}, function(error) {
		console.log(error);
		disconnect();
	});

}

/**
 * Function that generates random data
 */
function generateChartData() {

	var chartData = [];
	var nowTime = new Date();
	hours = nowTime.getHours();
	mins = nowTime.getMinutes();
	seconds = nowTime.getSeconds();
	Set_temp();
	for (var i = seconds; i < seconds + 30; i++) {
		var newDate = new Date(firstDate);
		newDate.setDate(firstDate.getDate());
		if(i >= 60){
			mins = mins + 1;
			if(mins >= 60){
				mins = 0;
				hours = hours + 1;
			}
			if(hours >= 24){
				hours = 0;
			}
			newDate.setHours(hours, mins, i-60);
		}
		else{
			newDate.setHours(hours, mins, i);
		}
		chartData.push({
			"time" : newDate,
			"temperature" : temperature_value
		});
	} 
	seconds = i;
	return chartData;
}

/**
 * Create the chart
 */
var chart = AmCharts.makeChart("chartdiv", {
	"type" : "serial",
	"theme" : "light",
	"zoomOutButton" : {
		"backgroundColor" : '#000000',
		"backgroundAlpha" : 0.15
	},
	"dataProvider" : generateChartData(),
	"categoryField" : "time",
	"categoryAxis" : {
		"parseDates" : true,
		"minPeriod" : "ss",
		"dashLength" : 1,
		"gridAlpha" : 0.15,
		"axisColor" : "#DADADA"
	},
	"graphs" : [ {
		"id" : "g1",
		"valueField" : "temperature",
		"bullet" : "round",
		"bulletBorderColor" : "#FFFFFF",
		"bulletBorderThickness" : 2,
		"lineThickness" : 2,
		"lineColor" : "#b5030d",
		"negativeLineColor" : "#0352b5",
		"hideBulletsCount" : 50
	} ],
	"chartCursor" : {
		"cursorPosition" : "mouse"
	}
})
/**
 * Set interval to push new data points periodically
 */
// set up the chart to update every second
setInterval(function() {
	// normally you would load new datapoints here,
	// but we will just generate some random values
	// and remove the value from the beginning so that
	// we get nice sliding graph feeling

	// add new one at the end
	var hours_value = 24;
	var mins_seconds_value = 60;
	var newDate = new Date(firstDate);
	
	seconds++;
	if(seconds >= 60){
		seconds = seconds - 60;
		mins = mins + 1;
		if(mins >= 60){
			mins = 0;
			hours = hours + 1;
			if(hours >= 24){
				hours = 0;
			}
		}
		
	}
	
	//newDate.setDate(firstDate.getDate());
	newDate.setHours(hours, mins, seconds);
	chart.dataProvider.push({
		time : newDate,
		temperature : temperature_value
	});

	// remove datapoint from the beginning
	chart.dataProvider.shift();
	chart.validateData();
}, 1000);
