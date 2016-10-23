'use strict'

let mongoose = require('mongoose')

let tagSchema = new mongoose.Schema({
    color: String,
    title: String,
    _id: Number
})

module.exports = mongoose.model('Tag', tagSchema);
