'use strict'

let mongoose = require('mongoose')

let tagSchema = new mongoose.Schema({
    color: String,
    title: String
})

module.exports = mongoose.model('Tag', tagSchema);
