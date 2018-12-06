var http = require("http");
var fs = require('fs');
var clientQueue = [];

http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
	console.log(request.url);
	if (request.url.startsWith('/api')){
		handleAPICall(request, response);
	} else {
		handleFileRequest(request, response);
	}
}).listen(8081);


function handleFileRequest(request, response){
	//file name will be after the leading /
	var file = '.'+request.url;
	if (request.url == '/'){
		file = 'client.html';
	}
	fileStat = fs.statSync(file);
	console.log("Requested the file: " + file);
	if (fileStat.isFile()){
		fs.readFile(file, (err, data) => {
			if (err){
				//TODO: add handling for file types
				console.log(err);
			}
			else{
				response.write(data);
			}
		})
	}
	else
	{
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.write("Requested the file: " + file);
	}
	response.end();
}

function handleAPICall(request, response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write("Requested invalid endpoint: " + request.url);
	response.end();
}

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');