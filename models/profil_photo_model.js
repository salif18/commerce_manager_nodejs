const mongoose = require("mongoose");
const schema = mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId, ref:"Users", require:true},
    photo:{type:String ,default:null}
},{timestamp:true});

module.exports = mongoose.model("Photo", schema)