'use strict'
let mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    name: {
      firstName: String,
      lastName: String
    },
    contact: {
      phone: { type: String, required: true},
      social: {
        facebook: String,
        twitter: String
      }
    },
    image: { type: String, required: true },
    bio: String,
    location: {
      city: String,
      state: String,
      country: String
    },
    interests: [String],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'Org'}],
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true}
});

//Methods
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
