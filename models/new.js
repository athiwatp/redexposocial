
'use strict'
let mongoose = require('mongoose')

let newSchema = new mongoose.Schema({
    title: {type:String, unique: true},
    body: String,
    tags: [{type: Number, ref: 'Tag'}],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org'},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      body: {type: String, required: true }
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
