var mongoose = require('mongoose')
var PicSchema = require('../schemas/pic')
var pic = mongoose.model('pic',PicSchema)
module.exports = pic
