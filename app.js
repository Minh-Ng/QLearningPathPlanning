var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
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


app.listen(8888);
