var clientID = 0, connections = 0;

$(function(){
	let url = prompt("Enter IMG URL:", "http://www.sdjgjx.com/up/pc/background%20pics.jpg");
	$("#background").append("<img id='img' src='" + url + "' height='" + window.innerHeight +"'>");

	var HOST = location.origin.replace(/^http/, 'ws');
	var clientSocket = new WebSocket(HOST);

	clientSocket.onmessage = ((event) => {
		let data = JSON.parse(event.data);
		(data.type === "NUM_CLIENT_CONNECTIONS") ? sendMsgScreenInfo(data) : null;
		(data.type === "RESIZE") ? resizeImgOnEachScreen(data) : null;
	})

	function sendMsgScreenInfo(data) {
		clientID = data.id;
		connections = data.clients;
		clientSocket.send(JSON.stringify({
			msgType: "IMG",
			type: "INFO",
			client: clientID,
			direction: "right",
			screen: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		}));
	}

	function resizeImgOnEachScreen(data) {
		console.log("RESIZE TO: ", data.screen, data.offset);
		$("#img").css("margin-left", -data.offset);
		$("#img").attr('width', data.screen.width);
	}

});