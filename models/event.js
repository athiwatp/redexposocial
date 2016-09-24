'use strict'
let mongoose = require('mongoose'),

var userSchema = new mongoose.Schema({
    title: { type:String, unique: true },
    body: String,
    organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Org' }],
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'Org' },
    date: {
      start: Date,
      end: Date,
      allDay: Boolean
    },
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
    images: [String],
    auth: Boolean
});

module.exports = mongoose.model('Event', userSchema);
