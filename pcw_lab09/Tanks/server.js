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
  });

  socket.on('join', function(data){ handleJoin(socket, data); });
});

function handleJoin(socket, data){
	console.log('A new client is joining. ' + socket.id);
	if (!data){
		console.log(data.toString());
	}
}

var serverData = {
	userQueue : {},
	ongoingGames : {},
}