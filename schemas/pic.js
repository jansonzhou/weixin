var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var PicSchema = new Schema({
    PicUrl:String,
    UserName:String,
    meta:{
            createAt:{type:Date, default:Date.now()},
            updateAt:{type:Date, default:Date.now()}
    }
});

PicSchema.pre('save',function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now()
    }
    next()
})

PicSchema.statics = {
    findByUser:function(username,cb){
        return this
        .find({UserName:username})
        .exec(cb)
    }
}

module.exports = PicSchema
