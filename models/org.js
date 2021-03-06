'use strict'
let mongoose = require('mongoose')

let orgSchema = new mongoose.Schema({
    name: {
      short: {type: String, unique: true, required: true},
      legal: {type: String, unique: true}
    },
    bio: String, //limit to 140c
    username: {type: String, unique: true, required: true},
    image: String,
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
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
    fundation: {
      date: Date,
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
      }
    },
    members: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      access: Number
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

orgSchema.methods.addMember = function(member_id, access) {
  this.members = this.members.push({'user':member_id, 'access': access})
}

module.exports = mongoose.model('Org', orgSchema);
