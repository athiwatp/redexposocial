'use strict'

let mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs')

let userSchema = new mongoose.Schema({
    access: {type: Number, default: 0},
    name: {
      firstName: { type: String, required: true },
      lastName: { type: String }
    },
    contact: {
      phone: { type: String },
      social: {
        facebook: String,
        twitter: String
      }
    },
    image: { type: String },
    bio: String,
    location: {
      city: String,
      state: String,
      country: String
    },
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    followingOrgs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Org'}],
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true}
})

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
