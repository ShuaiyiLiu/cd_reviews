'use strict'

var path = require('path');
var express = require('express');
var session = require('cookie-session');
var config = require('./config');

// TODO: logging, session, OAthu2

var app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

var images = require('./lib/images')();
var model = require('./lib/model-mongodb')(config); 

// Serve static files in Express
app.use(express.static('public'));

// Albums
app.use('/albums', require('./lib/crud')(model, images));
//app.use('/api/albums', require('./lib/api')(model));

app.get('/', function(req, res) {
    res.redirect('/albums');
});

// Basic error handler.
//app.use(function(err, req, res, next) {
//    res.status(500).send('Something broke!');
//});

// Start the server
var server = app.listen(config.port, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});

