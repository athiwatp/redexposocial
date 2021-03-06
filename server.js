'use strict';

var express = require('express'), //minimalist framwork for requests, responses, etc.
    bodyParser = require('body-parser'), //access information passed in url or body
    morgan = require('morgan'),
    helmet = require('helmet'), //Helmet helps you secure your Express apps by setting various HTTP headers.
    app = express() //initialize server

let API = require(__dirname + "/routers/api.js"), //assign api files to variable
    config = require(__dirname + "/config/config.js") //require config data

var port = process.env.PORT || 8080 //use port passed or 8080

app.use(helmet())
app.use('/static', express.static( __dirname + '/public'))
app.use(bodyParser.json({limit: '2mb'})) //Get elements from body (JSON)
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb'})) //Get elements from URL
app.use(morgan('dev')) //HTTP request logger middleware for node.js

app.use('/api', API) //use the api

app.use(function(req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
}) //use the root site.com/ and send this

app.listen(port, function () {
  console.log('App listening on port ' + port + '!');
}) //start the server
