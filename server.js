'use strict';

var express = require('express'),
    nunjucks = require('nunjucks'),
    app = express();

let API = require("./routers/api.js"),
    config = require("./config/config.js")

var port = process.env.PORT || 8080;

app.set('view engine', 'html');
app.use('/static', express.static( __dirname + '/public'));
app.use('/components', express.static( __dirname + '/bower_components'));

nunjucks.configure('public/views/', {
    autoescape: true,
    express: app
})

app.use('/', function(req, res) {
    res.render('index');
});

app.listen(port, function () {
  console.log('App listening on port ' + port + '!');
});
