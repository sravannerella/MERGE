const express = require('express'),
		app = express(),
		webSocketModule = require('ws'),
		socServer = webSocketModule.Server,
		PORT = process.env.PORT || 8080;

let i = 0, clients = [], clientIds = [];

app.use( express.static('node_modules') );
app.use( express.static('views') );

app.use((req, resp) => {
	resp.render('index.html')
});

let server = app.listen( PORT, () => {
	console.log("Server Listening on PORT: ", PORT);
});

const socket = new socServer({
	server
});

function sendAllClients(msg) {
	socket.clients.forEach((client) => {
		if(client.readyState === webSocketModule.OPEN){
			client.send(msg);
		}
	})
}

function sendAllClientButSender(msg, ws){
	socket.clients.forEach( (client) => {
		if(client !== ws && client.readyState === webSocketModule.OPEN){
			client.send(msg);
		}
	});
}

function sendSender(msg, ws, hitDirection="left"){
	msg = JSON.parse(msg);
	// msg.type = "CLIENT_BOUNCE";
	(msg.type === "CLIENT_BOUNCE") ? msg.type = "CLIENT_POSITION" : msg.type = "CLIENT_BOUNCE";
	console.log("GOT SENDER MSG:", msg);
	socket.clients.forEach( (client) => {
		if(client === ws && client.readyState === webSocketModule.OPEN){
			client.send( JSON.stringify(msg) );
		}
	});
}

function sendToClientID(msg,id){
	msg = JSON.parse(msg);

	if(msg.type === "CLIENT_POSITION"){
		let goNext = false;
		socket.clients.forEach((client) => {
			if(client.id === id && client.readyState === webSocketModule.OPEN){
				goNext = true;
			} else if(goNext){
				console.log(client.id);
				client.send(JSON.stringify(msg));
				goNext = false;
			}
		})
	} else if(msg.type === "CLIENT_BOUNCE") {
		let index = 0, i =0;
		socket.clients.forEach((client) => {
			i++;
			if(client.id === id && client.readyState === webSocketModule.OPEN){
				index = i;
			}
		});
		console.log("Index: ",index);
		clients[index - 2].send(JSON.stringify(msg));
	}
}

getUniqueId = () => {
	return i;
}


socket.on('connection', (ws, req) => {
	
	ws.id = getUniqueId();
	clients.push(ws);
	clientIds.push(ws.id);
	i++;

	let connectionMsg = {id: i, type: "NUM_CLIENT_CONNECTIONS", clients: clients.length};
	sendAllClients(JSON.stringify(connectionMsg));

	console.log("TOTAL CLIENTS: ", clients.length);

	ws.on('message', (msg) => {
		let msger = JSON.parse(msg);
		if(ws.id === clients[clients.length-1].id && msger.hitDirection === "right"){
			sendSender(msg, ws, "right");
		} else if(ws.id === clients[0].id && msger.hitDirection === "left") {
			msger.type = "CLIENT_POSITION";
			sendSender(msg, ws);
		} else {
			if(msger.type !== "CLIENT_POSITION" && msger.type !== "CLIENT_BOUNCE"){
				sendAllClients(msg);
			} else {
				// sendAllClientButSender(msg, ws);
				sendToClientID(msg, ws.id);
			}
		}
	});


	ws.on('close', (event) => {
		console.log("EVENT CLOSED", event);
		clients.splice(clients.indexOf(ws), 1);
		clientIds.splice(clientIds.indexOf(ws.id), 1);

		let connectionMsg = {id: i, type: "NUM_CLIENT_CONNECTIONS", clients: clients.length};
		sendAllClients(JSON.stringify(connectionMsg));
		console.log("TOTAL CLIENTS: ", clients.length);
	});
})

