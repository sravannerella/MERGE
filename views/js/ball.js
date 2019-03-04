function clicked(e) {
	console.log("EVENT:", e);
	let clientX = e.clientX - 25;
	let clientY = e.clientY - 25;

	$("#background").append("<div class='ball' style='width: 50px; height: 50px; position: absolute; left: " + clientX +"px; top: " + clientY +"px'></div>");
	loop(ballSpeed);
}

function loop(speed=5000, goLeft=true){
	let width = ($("#background").width() - 50) + "px";
	console.log("LOOP GOLEFT:", goLeft);
	if(goLeft){
		$(".ball").animate({
			'left': width
		}, speed, 'linear', () => {
			if(connections > 1){

				clientSocket.send(JSON.stringify({
					msgType: "BALL",
					type: "CLIENT_POSITION",
					client: clientID,
					hitDirection: "right",
					screen: {
						width: window.innerWidth,
						height: window.innerHeight
					},
					ball: {
						width: $(".ball").width(),
						height: $(".ball").height()
					},
					position: {
						x: $(".ball").position().left,
						y: $(".ball").position().top
					}
				}));

				$(".ball").remove();
			}
		});
	} 
	else {
		$(".ball").animate({
			'left': 0
		}, speed, 'linear', () => {
			if(connections > 1){

				clientSocket.send(JSON.stringify({
					msgType: "BALL",
					type: "CLIENT_BOUNCE",
					client: clientID,
					hitDirection: "left",
					screen: {
						width: window.innerWidth,
						height: window.innerHeight
					},
					ball: {
						width: $(".ball").width(),
						height: $(".ball").height()
					},
					position: {
						x: $(".ball").position().left,
						y: $(".ball").position().top
					}
				}));

				$(".ball").remove();
			}
		});
	}
}