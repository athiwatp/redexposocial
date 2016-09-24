'use strict'
let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    name: String,
    username: String,
    topics: [String],
    news: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'New'
    }],
    contact: {
      social: {
        facebook: String,
        twitter: String
      },
      url: String,
      numbers: [String],
      emails: [String]
    },
    location: {
      street: String,
      number: String,
      locality: String,
      pc: Number,
      state: String,
      country: String,
      position: {
        lat: String,
        lng: String
      }
    },
    events: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
});

module.exports = mongoose.model('Org', userSchema);
