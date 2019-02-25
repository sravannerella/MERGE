let app = {
    posList: []
}


var clientID = 0,
	ballSpeed = 2000,
	connections = 0;

var HOST = location.origin.replace(/^http/, 'ws');
console.log("PROCESS PORT SERVER:", process.env.PORT);
var clientSocket = new WebSocket(HOST);

function setEventID(event){
	console.log("CONNECTIONS", event);
	clientID = event.id;
	connections = event.clients;
	if($("#background").find("#num").length === 0) {
		$("#background").append("<p id='num'>" + clientID + "</p>");
	}
	app.posList.push(event);
}

function clientMethod(event){
	app.posList.push(event);
	drawBall(event);
	loop(ballSpeed);
}

function clientBounce(event) {
	app.posList.push(event);
	drawBall(event);
	loop(ballSpeed, false);
}

function drawBall(event){
	if(event.type === 'CLIENT_BOUNCE') {
		$("#background").append("<div class='ball' style='width: " + event.ball.width + "px; height: " + event.ball.height + "px; position: absolute; right: " + 0 +"px; top: " + event.position.y +"px'></div>");
	} else {
		$("#background").append("<div class='ball' style='width: " + event.ball.width + "px; height: " + event.ball.height + "px; position: absolute; left: " + 0 +"px; top: " + event.position.y +"px'></div>");
	}
}


clientSocket.onopen = (event) => {
    // console.log("Socket is Open: ", event);
};

clientSocket.onmessage = (event) => {
    let parsed = JSON.parse(event.data);
    (parsed.type === "NUM_CLIENT_CONNECTIONS" ? setEventID(parsed) : null);
    (parsed.type === "CLIENT_POSITION") ? clientMethod(parsed) : null;
    (parsed.type === "CLIENT_BOUNCE") ? clientBounce(parsed) : null;
    (app.posList.length > 5 ? app.posList.splice(1,4): null);

    app.posList.push(parsed);
};