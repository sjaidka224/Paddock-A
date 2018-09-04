/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var Cloudant = require('@cloudant/cloudant');

var myLink = "8ba7b7f2-1615-4e70-af1b-fa1e3ae72fa2-bluemix";
var myPassword = "2d7220c760e5dc706e79b5795d62033bc7d42ebd5729f3b2d761eea4f4289bd1";

var cloudant = Cloudant({account: myLink, password: myPassword});
cloudant.db.list(function (err,allDbs) {
  console.log ("My databases %s", allDbs.join(', '));
});

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: false}));
app.post('/project', function(req,res) {
  var project = req.body;
  var db = cloudant.db.use('paddockmanagement');

  db.insert(req.body, function (err, body, headers) {
    if (err) {
      res.send ('Project not inserted' + err.message);
      return comsole.log ('[db.insert]', err.message);
    }
    
    res.send ('Email inserted.');
  });
});
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
