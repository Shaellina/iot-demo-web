var stompClient = null;
//var i = 1;
var humidity_value = 0;
var temperature_value = 0;
var door_value = 0;



function showMessage(message) {
    var p = document.createElement('p');
    p.style.wordWrap = 'break-word';
    p.appendChild(document.createTextNode(message));
    $("#response").append(p);
    $("#response").scrollTop(10000000);
}

$( document ).ready(function() {
	connect();
    $("#response").html("");
    $("#graph").html("");
});



function connect() {
    
	var socket = new SockJS('/dashboard');
	   
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        graphStart();
        stompClient.subscribe('/topic/subscribe', function(message){
        	
//        
        	// graph value
           // temperature_value = JSON.parse(JSON.parse(message.body).body).temperature;         
            //humidity_value = JSON.parse(JSON.parse(message.body).body).humidity;
        	temperature_value = JSON.parse(JSON.parse(message.body).body);
            showMessage(new Date());
        	//showMessage("수신 content-type : " + message.headers["content-type"]);
        	var ct = JSON.parse(message.body).headers["content-type"];
        	ct ? "" : ct = JSON.parse(message.body).headers["Content-Type"];
        	showMessage("수신 본문의 content-type : " + ct);
        	var ot = JSON.parse(message.body).headers["x-m2m-ot"];
        	ot ? showMessage("수신 본문의 x-m2m-ot : " + ot) : "";
        	showMessage("수신 본문 내용  : " + JSON.parse(message.body).body);
        	
           
        });
    }, function(error) {
    	console.log(error);
    	disconnect();
    });
    
    
    
    
    
    
}



function graphStart(){
	var n = 60,		// x 축 범위를 위한 변수 
	random = d3.random.normal(0, 0), 
	//humidity_data = d3.range(n).map(random),		// 0~0 으로 x축(60) 범위를 초기화 한다.
	temperature_data = d3.range(n).map(random);
	//door_data = d3.range(n).map(random);
	var margin = {top: 20, right: 20, bottom: 20, left: 40},	// 그래프 상하좌우 공백
	width = 500 - margin.left - margin.right,	// 그래프 x 크기
	height = 280 - margin.top - margin.bottom;	// 그래프 y 크기 
	var x = d3.scale.linear()	// 그래프의 너비에 맞추어 x축을 0~59로 나눈다.
	    .domain([0, n - 1])
	    .range([0, width]);
	var y = d3.scale.linear()	// 그래프의 높이에 맞추어 0~100으로 나눈다.
		.domain([0, 100])
		.range([height, 0]);
	var line = d3.svg.line() 	// svg 라인이 설정되는(그려지는) 방법을 알려준다. 
		.x(function(d, i) { return x(i); })
		.y(function(d, i) { return y(d); });
	// div id 가 "graph" 인것에 svg 형식의 그래프 그려준다.
	var svg = d3.select("#graph").append("svg")    
		.attr("width", width + margin.left + margin.right)		// 너비 설정
		.attr("height", height + margin.top + margin.bottom)	// 높이 설정
		.append("g")	//  그룹 "g"  속성  추가 
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	// 변환(transform) 속성 설정 
	svg.style("stroke", "#000000")
	    .style("fill", "none")
	    .style("shape-rendering", "crispEdges");    // 그래프 색상 설정 
	svg.append("defs").append("clipPath")	// clipPath 설정 (보여지길 원하는 사이즈 설정, 이외는 버림) 
		.attr("id", "clip")
		.append("rect")  // rect 설정 
		.attr("width", width)
		.attr("height", height);
	svg.append("g")		// x 축에 대한 그룹 엘리먼트 설정 
		.attr("class", "x axis")
		.attr("transform", "translate(0," + y(0) + ")")
		.call(d3.svg.axis().scale(x).orient("bottom"));
	svg.append("g")		// y 축에 대한 그룹 엘리먼트 설정 
		.attr("class", "y axis")
		.call(d3.svg.axis().scale(y).orient("left"));
//	var humidity_path = svg.append("g") 
//		.attr("clip-path", "url(#clip)")
//		.append("path")    // 실제 데이터가 그려질 패스에 대한 설정 
//		.datum(humidity_data)
//		.attr("class", "line")
//		.attr("d", line);
//	humidity_path	// 실제 데이터가 그려질 패스에 대한 스타일 설정 
//		.style("stroke-width", 2)
//		.style("stroke", "#0000ff")
//		.style("fill", "none");	
	var temperature_path = svg.append("g") 
	.attr("clip-path", "url(#clip)")
	.append("path")    // 실제 데이터가 그려질 패스에 대한 설정 
	.datum(temperature_data)
	.attr("class", "line")
	.attr("d", line);
	temperature_path	// 실제 데이터가 그려질 패스에 대한 스타일 설정 
		.style("stroke-width", 2)
		.style("stroke", "#ff0000")
		.style("fill", "none");	
//	var door_path = svg.append("g") 
//	.attr("clip-path", "url(#clip)")
//	.append("path")    // 실제 데이터가 그려질 패스에 대한 설정 
//	.datum(door_data)
//	.attr("class", "line")
//	.attr("d", line);
//	door_path	// 실제 데이터가 그려질 패스에 대한 스타일 설정 
//		.style("stroke-width", 2)
//		.style("stroke", "#50d598")
//		.style("fill", "none");	
	tick();  

	function tick() {
		// 새로운 데이터를 뒤에 추가한다.
		//humidity_data.push(humidity_value);
		temperature_data.push(temperature_value);
		//door_data.push(door_value)
		// 라인을 PATH 방식으로 그리자!!!   
//		humidity_path
//			.attr("d", line)
//			.attr("transform", null)	// 기존 변환 행렬을 초기화하고  
//			.transition()		// 변환 시작
//			.duration(1000)		// 1초동안 애니매이션하게 설정
//			.ease("linear")		// ease 보간을 리니어로 처리
//			.attr("transform", "translate(" + x(-1) + ",0)")   //  변환행렬 설정   # 패스를 다시 그리는 방식                                                                                     //  아니라 좌표를 변환함으로써 출렁거리는것을 막는다. 
//			.each("end", tick);    //tick 함수 계속 호출 
		temperature_path
			.attr("d", line)
			.attr("transform", null)	// 기존 변환 행렬을 초기화하고  
			.transition()		// 변환 시작
			.duration(1000)		// 1초동안 애니매이션하게 설정
			.ease("linear")		// ease 보간을 리니어로 처리
			.attr("transform", "translate(" + x(-1) + ",0)")   //  변환행렬 설정   # 패스를 다시 그리는 방식                                                                                     //  아니라 좌표를 변환함으로써 출렁거리는것을 막는다. 
			.each("end", tick);    //tick 함수 계속 호출 
//		door_path
//		.attr("d", line)
//		.attr("transform", null)	// 기존 변환 행렬을 초기화하고  
//		.transition()		// 변환 시작
//		.duration(1000)		// 1초동안 애니매이션하게 설정
//		.ease("linear")		// ease 보간을 리니어로 처리
//		.attr("transform", "translate(" + x(-1) + ",0)")   //  변환행렬 설정   # 패스를 다시 그리는 방식                                                                                     //  아니라 좌표를 변환함으로써 출렁거리는것을 막는다. 
//		.each("end", tick);    //tick 함수 계속 호출 
		//가장 오래된 데이터를 제거한다.
		//humidity_data.shift();
		temperature_data.shift();
		//door_data.shift();
	}	
}