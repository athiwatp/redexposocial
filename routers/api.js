'use strict'

const express = require('express') //Express
const jwt = require('jsonwebtoken') //Package for authentication tokens
const multer = require('multer') //Package for managing file uploads
const mongoose = require('mongoose') //db connector
const fs = require('fs') //file writer
const path = require('path')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const apn = require('apn') //Apple Push Notifications Package
const router = express.Router() //Express router

const User = require(path.resolve('./models/user.js')) //Model for users
const Org = require(path.resolve('./models/org.js')) //Model for Organizations
const New = require(path.resolve('./models/new.js'))
const Tag = require(path.resolve('./models/tag.js'))
const Event = require(path.resolve('./models/event.js'))
const config = require(path.resolve('./config/config.js')) //Database connection, and secret password

//SECURITY, Brute force attack
const ExpressBrute = require('express-brute')
const MongoStore = require('express-brute-mongo')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

const store = new MongoStore(function (ready) {
  MongoClient.connect(config.database, function(err, db) {
    if (err) throw err
    ready(db.collection('bruteforce-store'))
  })
})
const bruteforce = new ExpressBrute(store)

const storage = multer.diskStorage({ //Storage helper
    destination: (req, file, callback) => callback(null, 'public/uploads/'), //File uploads destination
    filename: (req, file, cb) => { //Filenames for every upload, we'll use timestamp and stuff
        cb(null, `${file.fieldname}-${Date.now()}.${file.originalname.split('.')[file.originalname.split('.').length -1]}`)
    }
})

mongoose.connect('mongodb://localhost/red') //make db connection

const upload = multer({storage: storage}).single('file') //Upload things

// var apnProvider = new apn.Provider(config.apns)
//
// router.get('/notification',function(req,res){
//
//   let deviceToken = "51334be1b01a2f0c571cb2f42f3fda96116811cde34c5f07255cae73482de3c5"
//   var note = new apn.Notification();
//
//   note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
//   note.sound = "ping.aiff"
//   note.alert = "\uD83D\uDCE7You have another new asd as message"
//   note.payload = {'messageFrom': 'John Appleseed do'}
//   note.topic = "com.cesargdm.red-expo-social"
//
//   apnProvider.send(note, deviceToken).then( (result) => {
//     res.status(200).json(result);
//   })
//
// })

/*******************************
**                            **
**         API ROUTES         **
**                            **
********************************/

router.post('/users', function(req,res) {
  if (!req.body || !req.body.user) //If we dont have a body in the request or a user in the body request return error
    return res.status(400).json({'error':{'errmsg': "No user object specified"}}) //If it is not a return function it will be passing the next function
  User.findOne({$or: [{'email':req.body.user.email},{'username':req.body.user.username}]},'email username')
  .exec(function(err, user){ //This returns an error or the element
    if (err)
      res.status(500).json({'error':err}) //If there's an error return a 500 (internal server error)
    else {
      if (user) { //if user exists
        if (user.email === req.body.user.email && user.username === req.body.user.username) //Validate the user doesn't exists
          return res.status(409).json({'error':{'message': "Email and user already exists"}})
        if (user.username === req.body.user.username)
          return res.status(409).json({'error':{'message': "User already exists"}})
        if (user.email === req.body.user.email)
          return res.status(409).json({'error': {'message': "Email already exists"}})
      } else { //If no errors or authentication problems occurr, continue to create the user
        new User({
          name: {
            firstName: req.body.user.name.firstName,
            lastName: req.body.user.name.lastName
          },
          password: bcrypt.hashSync(req.body.user.password + config.secret), //Hash with salt
          email: req.body.user.email,
          username: req.body.user.username,
          tags: req.body.user.tags
        }) //Create the new user with the user object, all atributes will be passed
        .save(function(err, user){ //Save it, note the point, this is a concatenated function: like new User().save
          if (err)
            return res.status(500).json({'error': err, 'message': "Could not save the user"}) //If there's a problem saving the user return a 500
          let token = jwt.sign({'_id': user._id}, config.secret, {expiresIn: 604800}) //Sign token with the user id, set the secret password for ecryption, and set the expiration in 7 days
          res.status(201).json({'user': {'_id': user._id},'token': token, 'message': "User created, congrats"})
        })
      }
    }
  })
})

router.route('/tags')
.get(function(req,res){
  Tag.find()
  .exec(function(err,tags){
    if (err)
      return res.status(500).json({'error': err})
    res.status(200).json({tags: tags})
  })
})

router.route('/tags/:tag_id/news')
.get(function(req,res){
  New.find({tags: req.params.tag_id})
  .exec(function(err,news){
    if (err)
      return res.status(500).json({'error': err})
    res.status(200).json({news: news})
  })
})

router.route('/users/i=:user_identifier?')
.get(function(req,res){
  User.findOne({$or: [{'email': req.params.user_identifier},{ 'username': req.params.user_identifier}] })
  .exec(function(err, user){
    if (err)
      return res.status(500).json({error: err})
    if (user)
      return res.status(200).json({message: "User found"})
    res.status(404).json({message: "No user found"})
  })
})

router.route('/authenticate')
.get(function(req,res){

  const token = req.headers['x-access-token'] //check for the token uniquely in the headers

  if (token) { //Check that the request has a token
    jwt.verify(token, config.secret, function(err) { // Decode token and check it's valid with the secret password
      if (err)
        res.status(403).json({'message': "Failed to authenticate token."}) //End next requests and send a 401 (unauthorized)
      else//Send the decoded token to the request body
        res.status(200).json({'message': "You are authenticated :)"})
    })
  } else {
    res.status(401).json({'error':{'message': "No token provided"}})
  }
})
.post(bruteforce.prevent, (req, res) => {
  if (!req.body.username && !req.body.email) { //if no username or email is passed send this
    res.status(403).json({'message': "Authentication failed, no user specified" })
  } else {
    User.findOne({$or: [{'email': req.body.email},{ 'username': req.body.username}] }) //find just one user with the username or email
    .exec(function(err, user) {
      if (err)
        res.status(500).json({'error': err})
      else if (!user)
        res.status(401).json({message: "Authentication failed. Wrong user or password."}) //If user doesn't exists
      else {
        if (!user.comparePassword(req.body.password + config.secret)) //Add config.secreat as salt
          res.status(401).json({message: "Authentication failed. Wrong user or password."}); //If passwords don't match
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
        req._UID = decoded._id //Save the decoded user_id from the token to use in next routes
        next() //Continiue to the pleased route
      }
    })
  } else {
    res.status(403).json({'error':{'message': "No token provided, get yourself a token ._."}})
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
        org.addMember(req._UID, 3) //Push member to the org and add the access class '3'
        res.status(201).json({'message': "Org created!", 'org': org})
      }
    })
  }
})

router.route('/orgs/popular')
.get(function(req,res){
  Org.find()
  .exec(function(err,orgs){
    if (err)
      res.sztatus(500).json({error:err})
    //TODO: finish
  })
})

router.route('/orgs/:org_id')
.get(function(req,res){
  Org.findById(req.params.org_id) //Find by given _id, access it trough url (parameters)
  .exec(function(err, org){
    if (err)
      res.status(500).json({'error': err})
    else if (!org)
      res.status(404).json({'error': {'errmsg': "No org found, so bad so sad"}})
    else
      New.find({org: req.params.org_id}, 'title body tags images')
      .exec(function(err,news){
        if (err) {
          res.status(200).json({'org': org})
        }
        org = org.toObject()
        org.news = news
        res.status(200).json({'org': org})
      })
  })
})

router.route('/upload')
.post(function(req,res){

  if (!req.body.img)
    return res.status(400)

  var matches = req.body.img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      extension = matches[1].split('/')[1],
      random = Math.floor((Math.random() * 10) + 1),
      fileName = random + '' + Date.now() + '.' + extension

  var data = matches[0].replace(/^data:image\/\w+;base64,/, '')

  fs.writeFile(path.resolve('./public/uploads/') + fileName, data, {encoding: 'base64'},
  (err) => {
    if (err)
      return res.status(500)

    var path = "/static/uploads/" + fileName
    res.status(201).json({'path': path})

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
  .sort("-_id")
  .exec(function(err, news){
    if (err)
      res.status(500).json({'error': err})
    else if (!news || news.length === 0)
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
      New.find({favorites: req.params.user_id},'title body date')
      .exec(function(err, news){
        if (err)
          res.status(200).json({'user': user})
        user = user.toObject()
        user.favorites = news

        res.status(200).json({'user': user})
      })
    }
  })
})
.put(function(req,res){
  res.status(500).json({'message': "Not yet supported"})
})

router.route('/users/:user_id/photo')
.post(function(req,res){
  if (!req.body.img)
    return res.status(400)
  if (req.params.user_id !== req._UID)
    return res.status(403)

    console.log('IMG');
    console.log(req.body.img)

  var matches = req.body.img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      extension = matches[1].split('/')[1],
      random = Math.floor((Math.random() * 10) + 1),
      fileName = random + '' + Date.now() + '.' + extension

  var data = matches[0].replace(/^data:image\/\w+;base64,/, '')

  fs.writeFile(__dirname + '/../public/uploads/' + fileName, data, {encoding: 'base64'}, function(err){
    if (err) {
      return res.status(500)
    }

    User.findById(req.params.user_id)
    .exec(function(err, user) {
      var path = "/static/uploads/" + fileName
      user.image = path
      user.save(function(err){
        if (err)
          return res.status(500).json({err:err})
        res.status(201).json({'path': path})
      })
    })
  })
})


router.route('/users/:user_id/following/categories')
.get(function(req,res){

})
.post(function(req,res){

})

router.route('/users/:user_id/following/orgs')
.get(function(req,res){
  User.findById(req.params.user_id)
  .exec(function(req,res){

  })
})
.post(function(req,res){
  User.findByIdAndUpdate(req.params.user_id)
})

/*******************************
**                            **
**            NEWS            **
**                            **
********************************/


router.route('/news')
.get(function(req,res){
  New.find({})
  .populate('org author tags', 'name username title color')
  .sort('-_id')
  .exec(function(err,news){
    if (err)
      res.status(500).json({'error': err})
    else if (!news || news.length === 0)
      res.status(404).json({'error': {'errmsg': "No news found, go on and make 'em!"}})
    else {
      let mappedNews = news.map(function(obj){
        obj = obj.toObject()
        obj.favorited = favorited(obj, req._UID)
        return obj
      })

      User.findById(req._UID)
      .exec(function(err,user){
        if (err)
          return res.status(500).json({'error': err})
        user = user.toObject()
        if (user.access > 0) {
          return res.status(200).json({'news': mappedNews})
        }
        mappedNews = mappedNews.filter(function(newObject){
          let isInTags = false
          for (let tag in newObject.tags) {
            if (user.tags.indexOf(newObject.tags[tag]._id) >= 0) {
              isInTags = true
            }
          }
          return isInTags
        })
        res.status(200).json({'news': mappedNews})
      })
    }
  })
})
.post((req, res) =>
  User.findById(req._UID)
  .exec((err, user) => {
    if (err)
      return res.status(500).json({'error': err})

    if (user.access <= 0) { //TODO: Or admin of the page
      return res.status(301).json({message: "You are not admin of the org, or general admin >:|"})

      req.body.newObject.author = req._UID
      new New(req.body.newObject)
      .save((err, newObj) => {
        if (err)
          return res.status(500).json({'error': err})

        //TODO: Send PUSH NOTIFICATIONS

        res.status(201).json({new: newObj, message: "Successfully created new new ;)"})
      })
    }
  })
)

router.route('/news/:new_id')
.get((req,res) => {
  New.findById(req.params.new_id)
  .populate('org author comments.user tags', 'name username image title color')
  .sort('comments._id')
  .exec((err, newObject) => {
    if (err)
      return res.status(500).json({'error': err})
    if (!newObject)
      return res.status(404).json({'error': {'errmsg': "That new wasn't found, wtf happened?"}})

    newObject = newObject.toObject()
    newObject.favorited = favorited(newObject, req._UID)

    res.status(200).json({'new': newObject})

  })
})
.delete((req,res) => {
  res.status(500).json({'message': "Not yet supported"})
})


//Functions
function favorited(newObject, id) {
  for (var i = 0; i < newObject.favorites.length; i++) {
    if (JSON.stringify(newObject.favorites[i]) === JSON.stringify(id))
      return true
  }
  return  false
}

router.route('/news/:new_id/comments')
.post((req,res) => {
  if (req.body.comment.length === 0)
    return res.status(400).json({message: "Try something larger"})
  New.findByIdAndUpdate(req.params.new_id, {$push: {comments: {body: req.body.comment, user: req._UID}}}, {safe: true, new: true})
  .exec((err, result) => {
    if (err)
      return res.status(500).json({err: err})
    res.status(201).json({result:result})
  })
})
.get(function(req,res){
  New.findById(req.params.new_id,'comments')
  .exec(function(err,comments){
    if (err)
      return res.status(500).json({err: err})
    res.status(200).json(comments)
  })
})

router.route('/news/:new_id/favorites')
.get((req, res) => {
  res.status(500).json({'message': "Not yet supported"})
})
.post((req, res) => {
  New.findByIdAndUpdate(req.params.new_id, {$addToSet: {favorites: req._UID}}, {safe: true})
  .exec((err, result) => {
    if (err)
      return res.status(500).json({err: err})
    res.status(201).json({result:result})
  })
})
.delete((req,res) => {
  New.findByIdAndUpdate(req.params.new_id, {$pull: {favorites: req._UID}}, {safe: true})
  .exec((err, result) => {
    if (err)
      return res.status(500).json({err: err})
    res.status(200).json({result:result})
  })
})

/*******************************
**                            **
**           EVENTS           **
**                            **
********************************/

router.route('/events')
.get((req,res) => {
  //TODO: return just the number of attendance or some, not all
  Event.find()
  .sort('-_id')
  .populate('organizers')
  .exec((err,events) => {
    if (err)
      res.status(500).json({'error': err})
    else if (!events || events.length === 0)
      res.status(404).json({'error': {'errmsg': "No events found, this city is so boring"}})
    else
      res.status(200).json({'events': events})
  })
})
.post((req,res) => {

  User.findById(req._UID)
  .exec((err,user) => {
    if (err)
      return res.status(500).json({'error': err})

    if (user.access <= 0) //TODO: Or admin of the page
      return res.status(301).json({message: "You are not admin of the org, or general admin >:|"})

    req.body.eventObject.author = req._UID
    new Event(req.body.eventObject)
    .save((err, eventObject) => {
      if (err)
        return res.status(500).json({'error': err})

      //TODO: Send PUSH NOTIFICATIONS

      res.status(201).json({eventObject: eventObject, message: "Successfully created new event ;)"})
    })
  })
})

//TODO: get events by location queries, city name, coordinates, country

router.route('/events/:event_id')
.get((req, res) =>{
  //TODO: return just the number of attendance/likes or some names, not all
  //TODO: add createdBy
  Event.findById(req.params.event_id)
  .exec((err, event) =>{
    if (err)
      return res.status(500).json({'error': err})
    if (!event)
      return res.status(404).json({'error': {'errmsg': "That event wasn't found, maybe someone deleted it? Hahaha, no they cant, just cancell it"}})
    res.status(200).json({'events': event})
  })
})
.put((req, res) => {
  res.status(500).json({'message': "Not yet implemented"})
})
.delete((req, res) => {
  res.status(500).json({'message': "Not yet implemented"})
})

router.route('/events/:event_id/attendance')
.get((req, res) => {
  res.status(500).json({'message': "Not yet implemented"})
})
.post((req, res) => {
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
router.use((req, res, next) => {
  User.findById(req._UID, 'access') //Just get the access atribute of the user
  .exec(function(err,user){
    if (err)
      return res.status(500).json({'error':err})

    if (user.access <= 0) //Verify access level
      return res.status(401).json({'error': {'errmsg': "You have no power here, hahaha!!!, Uhm, I mean, that's sad :'("}})
    next() //Go to the next route

  })
})

router.route('/users')
.get(function(req,res){
  User.find({})
  .exec(function(err,users){
    if (err)
      return res.status(500).json({error:err})
    res.json({users: users})
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

router.route('/news/:new_id')
.put(function(req,res){
  delete req.body.new_id
  New.findByIdAndUpdate(req.params.new_id, {$set: req.body.new}, {upsert: true})
  .exec(function(err, newObject){
    if (err) {
      return res.status(500).json({'err':err})
    }
    res.status(200).json({'message': "Updated", 'new': newObject})
  })
})

router.route('/orgs/:org_id/followers')
.get(function(req,res){
  User.find({followingOrgs: req.params.org_id}, '-password -access')
  .exec(function(err,users) {
    if (err)
      return res.status(500).json({err:err})
    res.status(200).json({users:users})
  })
})

module.exports = router;
