'use strict'

let express = require('express'), //Express
    jwt = require('jsonwebtoken'), //Package for authentication tokens
    multer = require('multer'), //Package for managing file uploads
    mongoose = require('mongoose'), //db connector
    fs = require('fs'), //file writer
    bodyParser = require('body-parser'),
    router = express.Router() //Express router

let User = require("../models/user.js"), //Model for users
    Org = require("../models/org.js"), //Model for Organizations
    New = require("../models/new.js"),
    Event = require("../models/event.js"),
    config = require("../config/config.js") //Database connection, and secret password

let storage = multer.diskStorage({ //Storage helper
    destination: function (req, file, cb) { //File uploads destination
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) { //Filenames for every upload, we'll use timestamp and stuff
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

mongoose.connect('mongodb://localhost/red') //make db connection
let upload = multer({storage: storage}).single('file'); //Upload things

router.post('/users', function(req,res) {
  if (!req.body || !req.body.user) //If we dont have a body in the request or a user in the body request return error
    return res.status(400).json({'error':{'errmsg': "No user object specified"}}) //If it is not a return function it will be passing the next function
  User.findOne({$or: [{'email':req.body.email},{'username':req.body.username}]},'email username')
  .exec(function(err, user){ //This returns an error or the element
    if (err)
      res.status(500).json({'error':err}) //If there's an error return a 500 (internal server error)
    else {
      if (user) { //if user exists
        if (user.email == req.body.email && user.username == req.body.username) //Validate the user doesn't exists
          res.status(409).json({'error':{'message': "Email and user already exists"}})
        else if (user.username == req.body.username)
          res.status(409).json({'error':{'message': "User already exists"}})
        else if (user.email == req.body.email)
          res.status(409).json({'error': {'message': "Email already exists"}})
      } else { //If no errors or authentication problems occurr, continue to create the user
        new User(req.body.user) //Create the new user with the user object, all atributes will be passed
        .save(function(err, user){ //Save it, note the point, this is a concatenated function: like new User().save
          if (err) {
            res.status(500).json({'error': err, 'message': "Could not save the user"}) //If there's a problem saving the user return a 500
          } else {
            let token = jwt.sign({'_id': user._id}, config.secret, {expiresIn: 604800}) //Sign token with the user id, set the secret password for ecryption, and set the expiration in 7 days
            res.status(201).json({'user': {'_id': user._id},'token': token, 'message': "User created, congrats"})
          }
        })
      }
    }
  })
})

router.route('/authenticate')
.get(function(req,res){
  let token = req.headers['x-access-token'] //check for the token uniquely in the headers
  if (token) { //Check that the request has a token
    jwt.verify(token, config.secret, function(err) { // Decode token and check it's valid with the secret password
      if (err)
        res.status(401).json({'message': "Failed to authenticate token."}) //End next requests and send a 401 (unauthorized)
      else//Send the decoded token to the request body
        res.status(200).json({'message': "You are authenticated :)"})
    })
  } else {
    res.status(403).json({'error':{'message': "No token provided"}})
  }
})
.post(function(req, res) {
  if (!req.body.username && !req.body.email) { //if no username or email is passed send this
    res.status(403).json({'message': "Authentication failed, no user specified" })
  } else {
    User.findOne({$or: [{'email': req.body.email},{ 'username': req.body.username}] }) //find just one user with the username or email
    .exec(function(err, user) {
      if (err)
        res.status(500).json({'error': err})
      else if (!user)
        res.status(400).json({message: "Authentication failed. Wrong user or password."}) //If user doesn't exists
      else {
        if (!user.comparePassword(req.body.password))
          res.status(400).json({message: "Authentication failed. Wrong user or password."}); //If passwords don't match
        else {
          let token = jwt.sign({'_id': user._id}, config.secret, {expiresIn: 604800000}) //Sign token with the user id, set the secret password for ecryption, and set the expiration in 2 days
          res.status(200).json({'message': "Logged in, yay!", 'user': {'_id': user._id, 'name': user.name, 'username': user.username}, 'token': token })
        }
      }
    })
  }
})

//☝︎ All that is before this middleware won't be authenticated
//This is the middleware, this route will handle that the request has a token and it is valid, security
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  let token = req.headers['x-access-token'] //check for the token uniquely in the headers
  if (token) { //check that the request has a token
    jwt.verify(token, config.secret, function(err, decoded) { // Decode token and check it's valid with the secret password
      if (err)
        res.status(401).json({'success': false, 'message': "Failed to authenticate token."}) //End next requests and send a 401 (unauthorized)
      else { //Send the decoded token to the request body
        req._uid = decoded._id //Save the decoded user_id from the token to use in next routes
        next() //Continiue to the pleased route
      }
    })
  } else {
    res.status(403).json({'error':{'message': "No token provided"}})
  }
})

/*******************************
**                            **
**    ORGANIZATIONS/ORGS      **
**                            **
********************************/

router.route('/orgs')
.get(function(req,res){
  Org.find() //No parameters means find all
  .exec(function(err, orgs){
    if (err)
      res.status(500).json({'error': err})
    else
      res.status(200).json({'orgs': orgs})
  })
})
.post(function(req,res){
  //TODO: add createdBy
  if (!req.body || !req.body.org)
    res.status(400).json({'error':{'errmsg': "No org object specified"}}) //If it is not a return function it will be passing the next function
  else {
    new Org(req.body.org) //Create the new user with the user object, all atributes will be passed
    .save(function(err, org){ //Save it, note the point, this is a concatenated function: like new User().save
      if (err) {
        res.status(500).json({'error': err, 'message': "Could not save the org"}) //If there's a problem saving the user return a 500
      } else {
        //TODO: Check if this works
        org.addMember(req._uid, 3) //Push member to the org and add the access class '3'
        res.status(201).json({'message': "Org created!", 'org': org})
      }
    })
  }
})

router.route('/orgs/:org_id')
.get(function(req,res){
  Org.findById(req.params.org_id) //Find by given _id, access it trough url (parameters)
  .exec(function(err, org){
    if (err)
      res.status(500).json({'error': err})
    else if (!org)
      res.status(400).json({'error': {'errmsg': "No org found, so bad so sad"}})
    else
      res.status(200).json({'org': org})
  })
})

router.route('/orgs/:org_id/photo')
.post(function(req,res){
  if (!req.body.img)
    return res.status(400)

  var matches = req.body.img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      extension = matches[1].split('/')[1],
      random = Math.floor((Math.random() * 10) + 1),
      fileName = random + '' + Date.now() + '.' + extension

  var data = matches[0].replace(/^data:image\/\w+;base64,/, '')

  fs.writeFile(__dirname + '/../public/uploads/' + fileName, data, {encoding: 'base64'}, function(err){
    if (err) {
      return res.status(500)
    }
    Org.findById(req.params.org_id)
    .exec(function(err, org) {
      var path = "/static/uploads/" + fileName
      org.image = path
      org.save(function(err){
        if (err)
          return res.status(500)
        res.status(201).json({'path': path})
      })
    })

  })

})

router.route('/orgs/:org_id/members')
.get(function(req,res){
  Org.findById(req.params.org_id)
  .populate('members.user', 'name username') //Populate members.user (the whole array of members) using the user attribute as reference, with just the name and username info
  .exec(function(err, org){
    if (err)
      res.status(500).json({'error': err})
    else if (!org)
      res.status(400).json({'error': {'errmsg': "No org found, so bad so sad"}})
    else
      res.status(200).json({'members': org.members})
  })
})
.post(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})

router.route('/orgs/:org_id/news')
.get(function(req,res){
  News.find({org: req.params.org_id})
  .sort("-id")
  .exec(function(err, news){
    if (err)
      res.status(500).json({'error': err})
    else if (!news || news.length == 0)
      res.status(404).json({'error': {'message':"No news found"}})
    else
      res.status(200).json({news: news})
  })
})

router.route('/orgs/:org_id/events')
.get(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})

/*******************************
**                            **
**            USERS           **
**                            **
********************************/

router.route('/users/:user_id')
.get(function(req,res){
  User.findById(req.params.user_id, '-password -access') //Find this user but dont return password and access
  .exec(function(err,user){
    if (err)
      res.status(500).json({'error': err})
    else if (!user)
      res.status(404).json({'error': {'errmsg': "No user found, maybe it's a ghost?"}})
    else {
      res.status(200).json({'user': user})
    }
  })
})
.put(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})

/*******************************
**                            **
**            NEWS            **
**                            **
********************************/


router.route('/news')
.get(function(req,res){
  New.find({})
  .populate('org author', 'name username')
  .exec(function(err,news){
    if (err)
      res.status(500).json({'error': err})
    else if (!news || news.length == 0)
      res.status(404).json({'error': {'errmsg': "No news found, go on and make 'em!"}})
    else
      res.status(200).json({'news': news})
  })
})
.post(function(req,res){
  User.findById(req._uid)
  .exec(function(err,user){
    if (err)
      res.status(500).json({'error': err})
    else {
      if (user.access<=0) { //Or admin of the page
        res.status(301).json({message: "You are not admin of the org, or general admin >:|"})
      } else {
        req.body.new.author = req._uid
        new New(req.body.new)
        .save(function(err, newObj){
          if (err)
            res.status(500).json({'error': err})
          else
            res.status(201).json({new: newObj, message: "Successfully created new new"})
        })
      }
    }
  })
})

router.route('/news/:new_id')
.get(function(req,res){
  New.findById(req.params.new_id)
  .populate('org author', 'name username image')
  .exec(function(err,newObject){
    if (err)
      res.status(500).json({'error': err})
    else if (!newObject)
      res.status(404).json({'error': {'errmsg': "That new wasn't found, wtf happened?"}})
    else
      res.status(200).json({'new': newObject})
  })
})
.put(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})
.delete(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})

router.route('/news/:new_id/comments')
.get(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})

router.route('/news/:new_id/likes')
.get(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})
.post(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})

/*******************************
**                            **
**           EVENTS           **
**                            **
********************************/


router.route('/events')
.get(function(req,res){
  //TODO: return just the number of attendance or some, not all
  Event.find({})
  .exec(function(err,events){
    if (err)
      res.status(500).json({'error': err})
    else if (!events || events.length == 0)
      res.status(404).json({'error': {'errmsg': "No events found, this city is so boring"}})
    else
      res.status(200).json({'events': events})
  })
})
.post(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})

//TODO: get events by location queries, city name, coordinates, country

router.route('/events/:event_id')
.get(function(req,res){
  //TODO: return just the number of attendance/likes or some names, not all
  //TODO: add createdBy
  Event.findById(req.params.event_id)
  .exec(function(err,event){
    if (err)
      res.status(500).json({'error': err})
    else if (!event)
      res.status(404).json({'error': {'errmsg': "That event wasn't found, maybe someone deleted it? Hahaha, no they cant, just cancell it"}})
    else
      res.status(200).json({'events': event})
  })
})
.put(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})
.delete(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})

router.route('/events/:event_id/attendance')
.get(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})
.post(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})

router.route('/events/:event_id/comments')
.get(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})
.post(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})

router.route('/events/:event_id/likes')
.get(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})
.post(function(req,res){
  res.status(500).json({'message': "Not yet implemented"})
})


//☝︎ All that is before this middleware won't be protected for level 0
router.use(function(req, res, next) {
  User.findById(req._uid, 'access') //Just get the access atribute of the user
  .exec(function(err,user){
    if (err)
      res.status(500).json({'error':err})
    else {
      if (user.access <= 0) //Verify access level
        res.status(401).json({'error': {'errmsg': "You have no power here, hahaha!!!, Uhm, I mean, that's sad :'("}})
      else
        next() //Go to the next stuff
    }
  })
})

router.route('/users')
.get(function(req,res){
  User.find({})
  .exec(function(err,users){
    res.json({users: users});
  })
})

router.route('/orgs/:org_id')
.put(function(req,res){
  delete req.body.org._id

  Org.findByIdAndUpdate(req.params.org_id, {$set: req.body.org}, {upsert: true})
  .exec(function(err, org){
    if (err) {
      return res.status(500).json({'err':err})
    }
    res.status(200).json({'message': "Updated", 'org': org})
  })
})

module.exports = router;
