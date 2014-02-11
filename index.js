var server = require('./server');
var router = require('./router');
var requestHandler = require('./requestHandler');

var handle = {}
handle["/"] = requestHandler.start;
handle["/login"] = requestHandler.login;
handle["/redirect_page"] = requestHandler.handleFacebookDialogResponse;
handle["/get_info"] = requestHandler.getInfo;
server.start(router.route, handle);

