'use strict'

let express = require('express'), //Express
    jwt = require('jsonwebtoken'), //Package for authentication tokens
    multer = require('multer'), //Package for managing file uploads
    router = express.Router() //Express router

let User = require("../models/user.js"), //Model for users
    Organizations = require("../models/org.js"), //Model for Organizations
    config = require("../config/config.js") //Database connection, and secret password

let storage = multer.diskStorage({
    destination: function (req, file, cb) { //File uploads destination
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) { //Filenames for every upload, we'll use timestamp and stuff
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

let upload = multer({storage: storage}).single('file'); //Upload thing

router.post('/users', function(req,res) {
  User.findOne({$or: [{'email':req.body.user.email},{'username':req.body.user.username}]},'email username')
  .exec(function(err,user){
    if (err) (err) => res.status(500).json({'error':err}) //If there's an error return a 500 (internal server error)
    else {
      if (user.email == req.body.user.email && user.username == req.body.user.username) res.status(409).json({'error':{'message': "Email and user already exists"}})
      else if (user.username == req.body.user.username) res.status(409).json({'error':{'message': "User already exists"}})
      else if (user.email == req.body.user.email) res.status(409).json({'error': {'message': "Email already exists"}})
      else { //If no errors or authentication problems occurr, continue to create the user
        let newUser = new User({ //Create new user with request body
          name: req.body.user.name, //{firstname, lastname}
          image: req.body.user.image,
          bio: req.body.user.bio,
          password: newUser.generateHash(req.body.user.password),
          email: req.body.user.email,
          username: req.body.user.username
        })
        newUser.save(function(err, user){
          if (err) (err) => res.status(500).json({'error': err, 'message': "Could not save the user"}) //If there's a problem saving the user return a 500
          else {
            let token = jwt.sign({'_id': user._id}, config.secret, {expiresIn: 604800}) //Sign token with the user id, set the secret password for ecryption, and set the expiration in 7 days
            res.status(201).json({'user': {'_id':user._id},'token':token, 'message': "User created"})
          }
        })
      }
    }
  })
})

router.post('/authenticate', function(req, res) {
  if (req.body.username || req.body.email) { // Verify that the username is really there. Done for security reasons
    User.findOne({$or:[{'email': req.body.email},{ 'username': req.body.username}]},'username name email')
    .exec(function(err, user) {
      if (err) res.status(500).json({'error': err})
      else if (!user) res.status(400).json({message: 'Authentication failed. Wrong user or password.'}) //If user doesn't exists
      else if (user) {
        if (!user.comparePassword(req.body.password)) res.status(400).json({message: 'Authentication failed. Wrong user or password.'}); //If passwords don't match
        else {
          let token = jwt.sign({'_id': user._id}, config.secret, {expiresIn: 604800}) //Sign token with the user id, set the secret password for ecryption, and set the expiration in 7 days
          res.status(200).json({'message': "Logged in", 'user': user, 'token': token });
        }
      }
    })
  } else {
    res.status(400).json({'message': "Authentication failed, no user specified" });
  }
})

//☝︎ All that's before this middleware won't be authenticated
//This is the middleware, this route will handle that the request has a token and it is valid, security
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  let token = req.body.token || req.query.token || req.headers['x-access-token']; // check header or url parameters or post parameters for token
  if (token) { //Check that the request has a token
    jwt.verify(token, config.secret, function(err, decoded) { // Decode token and check it's valid with the secret password
      if (err) return res.status(401).json({'success': false, 'message': 'Failed to authenticate token.'}) //End next requests and send a 401 (unauthorized)
      else { //Send the decoded token to the request body
        req.u_id = decoded._id; //Save the decoded user_id from the token to use in next routes
        next() //Continiue to the pleased route
      }
    })
  } else {
    res.status(403).json({'error':{'message': "No token provided"}})
  }
})

/********************
**                 **
**  ORGANIZATIONS  **
**                 **
*********************/

router.route('/organizations')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

router.route('/organizations/:org_id')
.get(function(req,res){
  res.status(500).json({})
})
.put(function(req,res){
  res.status(500).json({})
})

router.route('/organizations/:org_id/users')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

router.route('/organizations/:org_id/news')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

router.route('/organizations/:org_id/events')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

/********************
**                 **
**      USERS      **
**                 **
*********************/

router.route('/users/:user_id')
.get(function(req,res){
  res.status(500).json({})
})
.put(function(req,res){
  res.status(500).json({})
})

/********************
**                 **
**      NEWS       **
**                 **
*********************/

router.route('/news')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

router.route('/news/:new_id')
.get(function(req,res){
  res.status(500).json({})
})
.put(function(req,res){
  res.status(500).json({})
})
.delete(function(req,res){
  res.status(500).json({})
})

router.route('/news/:new_id/users')
.get(function(req,res){
  res.status(500).json({})
})

router.route('/news/:new_id/comments')
.get(function(req,res){
  res.status(500).json({})
})

router.route('/news/:new_id/likes')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

/********************
**                 **
**      EVENTS     **
**                 **
*********************/

router.route('/events')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

router.route('/events/:event_id')
.get(function(req,res){
  res.status(500).json({})
})
.put(function(req,res){
  res.status(500).json({})
})
.delete(function(req,res){
  res.status(500).json({})
})

router.route('/events/:event_id/users')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

router.route('/events/:event_id/comments')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

router.route('/events/:event_id/likes')
.get(function(req,res){
  res.status(500).json({})
})
.post(function(req,res){
  res.status(500).json({})
})

module.exports = router;
