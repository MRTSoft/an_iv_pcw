var http = require("http").createServer(handler);
var fs = require('fs');
var io = require('socket.io')(http);
var clientQueue = [];


function handler(request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
	//console.log(request.url);
	if (request.url.startsWith('/api')){
		handleAPICall(request, response);
	} else {
		handleFileRequest(request, response);
	}
}

http.listen(8081);


function handleFileRequest(request, response){
	//file name will be after the leading /
	var file = '.'+request.url;
	if (request.url == '/'){
		file = 'client.html';
	}
	//console.log("Requested the file: " + file);
	if (fs.existsSync(file)){
		fs.readFile(file, (err, data) => {
			if (err){
				//TODO: add handling for file types
				console.log(err);
			}
			else{
				response.write(data);
			}
			response.end();
		})
	}
	else
	{
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write("Requested non-existent file: " + file);
		response.end();
	}
}

function handleAPICall(request, response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write("Requested invalid endpoint: " + request.url);
	response.end();
}

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

// Socket code

io.on('connection', function(socket){
  console.log('A user connected: ' + socket.id);
  socket.on('disconnect', function(){
    console.log('user disconnected');
    //TODO remove them from any active games
  });

  socket.on('join', function(data){ handleJoin(socket, data); });

  socket.on('fire', function(data){handleFire(socket, data);});

  socket.on('aim', function(data){handleAim(data)});
});

function handleJoin(socket, data){
	console.log('A new client is joining. ' + socket.id);
	if (data){
		//console.log(data);
		var userCount = serverData.userQueue.length;
		serverData.userQueue[userCount] = socket.id;
		userCount = serverData.userQueue.length;
		if (userCount == 2){
			var newGameId = 'g' + serverData.nextGame;
			serverData.nextGame = serverData.nextGame + 1; 
			game = new Game(newGameId, serverData.userQueue);
			//console.log(game);
			serverData.ongoingGames[newGameId] = game;
			message = new goMessage(newGameId);
			io.to(game.players[0]).emit('go', message);
			io.to(game.players[1]).emit('go', message);
			serverData.userQueue.shift();
			serverData.userQueue.shift();
		}
		else {
			socket.emit('wait', {});
		}
		//console.log(serverData);
	}
}

function handleFire(socket, data){
		
	if (serverData.ongoingGames[data.gameId]){
		game = serverData.ongoingGames[data.gameId];
		if (game.players[0] != socket.id && game.players[1] != socket.id){
			return;
		}
		simulatePlay(data);
		game = serverData.ongoingGames[data.gameId];
		if (game){
			message = new goMessage(data.gameId);
			io.to(game.players[0]).emit('go', message);
			io.to(game.players[1]).emit('go', message);
		}
	}
}

function handleAim(data){
	if (serverData.ongoingGames[data.gameId]){
		game = serverData.ongoingGames[data.gameId];
		oponent = game.getOponentOf(game.nextMove);
		io.to(oponent).emit('aim', data);
	}
}

function simulatePlay(data){
	//TODO
	game = serverData.ongoingGames[data.gameId];
	index = game.players.indexOf(data.id);
	//See if it hit the target
	origin = {x:0,y:0};
	launchAngle = data.angle;
	launchPower = data.power;
	if (game.nextMove == game.players[1]){
		origin.x = 2;
	}
	if (distanceToTarget(game.target, data.angle, data.power, origin) < target.radius){
		game.points[game.nextMove]++; //add a point
		game.target = generateTarget();
		if (game.points[game.nextMove] == 10){
			io.to(game.nextMove).emit('win', {});
			io.to(game.getOponentOf(game.nextMove)).emit('lost', data);
			delete serverData.ongoingGames[data.gameId];
			return;
		}
	}
	serverData.ongoingGames[data.gameId].nextPlayer();
}

function distanceToTarget(target, angle, power, origin){
	return 1;
}

var serverData = {
	userQueue : [],
	ongoingGames : {},
	nextGame : 0,
};

function generateTarget(){
	playArea = {
		x1: 0.1,
		y1: 0.1,
		x2: 1.9,
		y2: 0.9,
	}
	function inInterval(a, b, c){
		return (c >= a) && (c <= b);
	}
	do {
		target = {
			x : 2 * Math.random(), 
			y: Math.random(), 
			radius = 0.05,
		}
	}while(
		inInterval(playArea.x1, playArea.x2, target.x) && 
		inInterval(playArea.y1, playArea.y2, target.y));
	return target;
}
class Game {
	constructor(gameId, pData){
		//players in an array with exactly 2 player's id
		var first = (Math.random() > 0.5) ? 1 : 0;
		var second = 1 - first;
		this.players = [];
		this.gameId = gameId;
		this.players[first] = pData[0];
		this.players[second] = pData[1];
		this.points = [];
		this.points[pData[0]] = 0;
		this.points[pData[1]] = 0;
		this.target = generateTarget();
		this.nextMove = pData[first];
	}

	nextPlayer(){
		//Advance to the following player
		this.nextMove = (this.nextMove == this.players[0]) ? 
						this.players[1] : this.players[0];
	}

	 getOponentOf(player){
	 	if (this.players[0] == player){
	 		return this.players[1];
	 	}
	 	return this.players[0];
	 }
}
class goMessage{
	constructor(gameId){
		this.gameId = gameId;
		var game = serverData.ongoingGames[gameId];
		this.playerTurn = game.nextMove;
		this.firstPlayer = game.players[0];
		this.target = game.target;
		this.points = game.points;
	}
}