const mongoose = require("mongoose")
const schema = mongoose.Schema({
    userId:{type:String , require:true},
    title:{type:String, require:true}
},{timestamps:true})

module.exports = mongoose.model("Posts",schema)