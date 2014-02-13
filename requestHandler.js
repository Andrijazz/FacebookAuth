var fs = require('fs');
var url = require('url');
var https = require('https');
var facebook = require('./facebook');

// TODO: create config file
var app_id = '648821675177212';
var redirect_uri = 'https://localhost:8080/redirect_page';
var app_secret = '0993c3b6c959ee6d96a0042ed787d1de';

var users = {};

var access_token;
var facebook_api;

// dealing with Facebook stuff functions
function fireLoginDialog(response) {
	console.log("Redirecting to Facebook login dialog ...");
	response.end('<script type=\"text/javascript\">window.location.href=\"' +
'https://www.facebook.com/dialog/oauth?client_id=' + app_id + '&redirect_uri=' +
encodeURIComponent(redirect_uri) + '\"</script>');
};

function parseAccessToken(token) {
    access_token = url.parse('https://blabla.bla?' + token, true).query.access_token;
    console.log("Access token obtained.");
    return access_token;
}

// function checkIsUserLoggedIn(user_id){
// 	// TODO: Handle token expires...
// 	if (users[user_id] === undefined)
// 		return false;
// 	return true;
// }

function getAccessToken(code, response) {
	https.get('https://graph.facebook.com/oauth/access_token'+ '?client_id=' + app_id + '&redirect_uri=' +
	encodeURIComponent(redirect_uri) + '&client_secret=' + app_secret + '&code=' + code, function (res) {
		var token = "";
		
		res.on('data', function (chunk) {
			token += chunk;
		});

		res.on('end', function (res) {
			console.log("token: " + token);
			token = parseAccessToken(token);
			facebook_api = new facebook.Facebook(token);
			show_welcome_page(response);
			// var user_id="";
			
			// // get the user id
			// if (facebook_api !== undefined){	
			// 	facebook_api.graph('/me?fields=id', function (id) {
			// 		user_id = id.id;
			// 		// store the user
			// 		users[user_id] = facebook_api;
			// 		show_welcome_page(response);
			// 		});		
			// 	}	
			// }
			// else{ // TODO: How to handle this scenario?
			// 	show_try_again_page(response);
			// }		
		});
	}); 
}
// Request handling

function start(request, response){
	// show main page
	console.log("handle start...");
	fs.readFile('main_page.html', function(error, text){
		if (error){
			response.writeHead(404, "Content-Type", "plain/html");
		    response.end(error);
		}
		else {
			response.writeHead(200, {"Content-Type": "text/html"});
  			response.end(text);	
  		}
  			
	});
}

function login(request, response){
	// redirect url to facebook login dialog
	console.log("handle login event (login button clicked) - redirect to FB login dialog...");
	fireLoginDialog(response);
}

function handleFacebookDialogResponse(request, response){
	console.log('handle facebook login dialog response... check if request contains code ...');
	// store the user code
	var code = url.parse(request.url, true).query.code;
	// load the right page
	if (code === undefined){
		show_try_again_page(response);
	}
	else {
		// get access token and load the page
		getAccessToken(code, response);
	}
}


function getInfo(request, response){
	console.log("getInfo...");
	if (facebook_api !== undefined)
	{	
		response.writeHead(200, {'Content-Type': 'text/html'});
		facebook_api.graph('/me?fields=id', function (id) {
			id = id.id;
			facebook_api.fql('select name, pic_small from user where uid=me()', function (data) {
				data = data[0];
				var body =	'<\!DOCTYPE html>'
							+ '<html>'
							+ '<title>andrija_login_app</title>'
							+ '<body> <h1>Welcome</h1> '
							+ ' <form action=\"/get_info\" method=\"post\"> '
							+ ' <input type=\"submit\" value=\"Get Info\">'
							+ ' </form>'
									+ '<p>Name: ' + data.name + '</p><br>'
									+ '<img src=\"' + data.pic_small + '\" /> '
							+ ' </body>	</html>';			
				response.end(body);
			});
		});
	}
	else
	{
		show_try_again_page(response);
	}
}

function show_welcome_page(response) {
	fs.readFile('welcome.html', function(error, text){
		if (error){
			response.writeHead(404, "Content-Type", "plain/html");
		    response.end(error);
		}
		else {
			response.writeHead(200, {"Content-Type": "text/html"});
  			response.end(text);	
  		}
  	});
  	console.log("facebook: " + facebook );
}

function show_try_again_page(response) {
	fs.readFile('try_again.html', function(error, text){
		if (error){
			response.writeHead(404, "Content-Type", "plain/html");
		    response.end(error);
		}
		else {
			response.writeHead(200, {"Content-Type": "text/html"});
  			response.end(text);	
  		}
  			
	});
}

exports.start = start;
exports.login = login;
exports.handleFacebookDialogResponse = handleFacebookDialogResponse;
exports.getInfo = getInfo;
