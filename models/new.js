'use strict'
let mongoose = require('mongoose'),

var userSchema = new mongoose.Schema({
    title: {type:String, unique: true},
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      body: String
    }],
    date: Date,
    location: {
      state:String,
      country: String
    },
    images: [String],
    auth: Boolean
});

module.exports = mongoose.model('New', userSchema);
