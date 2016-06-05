var spawn   = require('child_process').spawn;
var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res) {
	var selector = req.query.cfg;
	var valid = true;

	if(selector) {
		var command = spawn(__dirname + '/config/config.sh', [ selector ]);
		var output = [];

		command.stdout.on('data', function(chunk) {
		    output.push(chunk);
		}); 

		command.on('close', function(code) {
		    if (code === 0)
		    	valid = true;
		    else
		    	valid = false;
		});
	}

	if(valid)
	    res.sendFile(path.join(__dirname + '/html/index.html'));
	else
        res.sendStatus(500); // Script fails, generate a Server Error HTTP response
});

app.get('/about', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/about.html'));
});

app.get('/config/config.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/config/config.json'));
});

app.get('/js/ReinforcementLearning.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/ReinforcementLearning.js'));
});

app.get('/js/LoadConfig.js', function(req, res) {

    res.sendFile(path.join(__dirname + '/js/LoadConfig.js'));
});

app.get('/js/Underscore.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/Underscore.js'));
});

app.get('/js/main.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/main.js'));
});

app.get('/js/require.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/require.js'));
});

app.get('/js/bootstrap.min.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/bootstrap.min.css'));
});

app.use('/favicon.ico', express.static('images/favicon.ico'));

app.all('*', function(req, res) {
  res.redirect("/");
});

app.listen(8888);
