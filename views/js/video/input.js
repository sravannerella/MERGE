var clientID = 0, connections = 0;

$(function(){
	let url = prompt("Enter Youtube Video:", "http://www.sdjgjx.com/up/pc/background%20pics.jpg");
	$("#background").append("<img src='" + url + "' width='"+ window.innerWidth +"' height='" + window.innerHeight +"'>");

	var HOST = location.origin.replace(/^http/, 'ws');
	var clientSocket = new WebSocket(HOST);

	clientSocket.onmessage = ((event) => {
		let data = JSON.parse(event.data);
		console.log("MSG: ", data);
		(data.type === "NUM_CLIENT_CONNECTIONS") ? sendMsgExpandScreen(data) : null;
		(data.type === "EXPAND") ? resizeImgOnEachScreen(data) : null;
	})

	function sendMsgExpandScreen(data) {
		clientID = data.id;
		connections = data.clients;
		clientSocket.send(JSON.stringify({
			msgType: "IMG",
			type: "EXPAND",
			client: clientID,
			direction: "right",
			screen: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		}));
	}

	function resizeImgOnEachScreen(data) {
		console.log("RESIZE TO: ", data.screen);
	}

});