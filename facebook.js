var https = require('https');
var url = require('url');

// TODO: create config file
var graph_host = 'graph.facebook.com';
var graph_access_token_path = '/oauth/access_token';
var fql_query_host = 'api.facebook.com';
var fql_query_path = '/method/fql.query';


/**
* Interact with the Facebook API.
*
* Will use the Graph API and the FQL.
*
* @param access_token The authenticating access token
*/
function Facebook(access_token) {

        /**
        * Send the https GET request
        *
        * @param opts Options for the https.get function
        * @param callback The callback function
        */

        function get(opts, callback) {
                https.get(opts, function (res) {
                        var data = "";
                        res.on('data', function (chunk) { data += chunk; console.log(chunk); });
                        res.on('end', function () { callback(JSON.parse(data)); });
                });
        }

        /**
        * Make a Graph API call.
        *
        * @param target Path to the resource
        * @param callback Function to call when data is retrieved
        */
        this.graph = function (target, callback) {
                var opts = {
                        host: graph_host,
                        path: (target + '&access_token=' + access_token)
                };
                get(opts, callback);
        }

        /**
        * Make a FQL query.
        *
        * @param query The FQL query in string form
        * @param callback Function to call when the data is available
        */
        this.fql = function (query, callback) {
                var opts = {
                        host: fql_query_host,
                        path: (fql_query_path + '?query=' + encodeURIComponent(query) + '&format=json&access_token=' + access_token)
                };
                get(opts, callback);
        }
}

exports.Facebook = Facebook;