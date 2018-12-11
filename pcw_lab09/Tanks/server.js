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
	console.log("Requested the file: " + file);
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
});

function handleJoin(socket, data){
	console.log('A new client is joining. ' + socket.id);
	if (data){
		console.log(data);
		var userCount = serverData.userQueue.length;
		serverData.userQueue[userCount] = socket.id;
		userCount = serverData.userQueue.length;
		if (userCount == 2){
			var newGameId = 'g' + serverData.nextGame;
			serverData.nextGame = serverData.nextGame + 1; 
			var first = (Math.random > 0.5) ? 1 : 0;
			var second = 1 - first;
			message = {
				gameId : newGameId,
				playerTurn : serverData.userQueue[first],
			};
			game = {
				players : [
					serverData.userQueue[first],
					serverData.userQueue[second],		
				],
				hps : [100,100],
				positions : [{x: 0, y: 0}, {x : 0, y: 0}],
				nextMove : serverData.userQueue[first],
			};
			console.log(game);
			serverData.ongoingGames[newGameId] = game;
			io.to(game.players[0]).emit('go', message);
			io.to(game.players[1]).emit('go', message);
			serverData.userQueue.shift();
			serverData.userQueue.shift();
		}
		else {
			socket.emit('wait', {});
		}
		console.log(serverData);
	}
}

function handleFire(socket, data){
	if (serverData.ongoingGames[data.gameId]){
		game = serverData.ongoingGames[data.gameId];
		if (game.players[0] != socket.id && game.players[1] != socket.id){
			return;
		}
		simulatePlay(game, socket.id);
		io.to(game.players[0]).emit('srv-update', message);
		io.to(game.players[1]).emit('srv-update', message);
		io.to(game.players[0]).emit('go', message);
	}
}

function simulatePlay(game, user){
	//TODO
}

var serverData = {
	userQueue : [],
	ongoingGames : {},
	nextGame : 0,
};