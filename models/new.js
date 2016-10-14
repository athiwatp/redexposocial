'use strict'
let mongoose = require('mongoose')

let newSchema = new mongoose.Schema({
    title: {type:String, unique: true},
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org'},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      body: String
    }],
    date: {
      type:Date,
      default: new Date
    },
    location: {
      city: String,
      state:String,
      country: String
    },
    images: [String],
    auth: Boolean
});

module.exports = mongoose.model('New', newSchema);
