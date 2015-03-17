var fs = require("fs")
var path = require("path")
exports.mkdir = mkdir
function mkdir(dirpath,callback){
    fs.exists(dirpath, function(exists){
        if(exists){
            callback(dirpath);
        } else {
            mkdir(path.dirname(dirpath),function(){
                fs.mkdir(dirpath, callback)
            })
        }
    })

}
