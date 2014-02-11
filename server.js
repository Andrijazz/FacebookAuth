var https = require('https');
var fs = require('fs');
var url = require('url');

var options = {
	key: fs.readFileSync('agent2-key.pem'),
	cert: fs.readFileSync('agent2-cert.pem')
};

function start(route, handle){
	
	function onRequest(request, response){

		var pathname = url.parse(request.url).pathname;
		console.log("url: " + request.url);
		route(handle, pathname, request, response);
	

	}

	var server = https.createServer(options, onRequest);

	server.listen(8080);
	console.log("Server running on https://localhost:8080");
}


exports.start = start