const express = require('express'),
		app = express(),
		webSocketModule = require('ws'),
		socServer = webSocketModule.Server,
		PORT = process.env.PORT || 8080;

let i = 0, clients = [], clientScreenSizes = [];

app.use( express.static('node_modules') );
app.use( express.static('views') );

app.get('/', (req, resp) => {
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

function sendToClientID(msg, id){
	clients.forEach((client) => {
		if(client.id === id && client.readyState === webSocketModule.OPEN){
			client.send(msg);
		}
	})
}

getUniqueId = () => {
	return i;
}

function calculateSizes(){
	let i=0, offset=0, screenWidth=0;
	clients.forEach((client) => {
		let filtered = clientScreenSizes.filter((screenSize) => {
			return screenSize.id === client.id;
		});

		(i>0) ? offset += clientScreenSizes[i].screen.width : null;

		screenWidth = clientScreenSizes.reduce((total, size) => total += size.screen.width, 0);
		i++;

		let offsetMsg = {
			id: client.id,
			type: "RESIZE",
			screen: {
				width: screenWidth,
				height: filtered[0].screen.height
			},
			offset: offset
		}

		client.send(JSON.stringify(offsetMsg));
	})
}

function recordScreenInfo(msg, id){
	let filtered = clientScreenSizes.filter((client)=>{
		return client.id === id;
	})

	console.log("FILTERED SCREENS: ", filtered);

	if(filtered.length === 0){
		clientScreenSizes.push({
			id: id,
			screen: msg.screen
		});
		console.log("RECORDED SCREEN SIZE", id);
	}

	console.log("CLIENT LENGTH:", clientScreenSizes.length);

	(clientScreenSizes.length === clients.length) ? calculateSizes() : null;
}

socket.on('connection', (ws, req) => {
	console.log("NEW CONNECTION:");
	ws.id = getUniqueId();
	clients.push(ws);
	i++;

	let connectionMsg = {
		id: i,
		type: "NUM_CLIENT_CONNECTIONS",
		clients: clients.length
	};

	sendAllClients(JSON.stringify(connectionMsg));

	ws.on('message', (msg) => {
		console.log("GOT MSG");
		let msger = JSON.parse(msg);

		let clientScreen = clientScreenSizes.filter((size) => {
			size.id === ws.id;
		});

		(msger.type === "INFO" && clientScreen.length === 0) ? recordScreenInfo(msger, ws.id) : null;
		// calculateSizes(msger);
	});

});