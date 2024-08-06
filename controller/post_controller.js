const Posts = require("../models/posts_model")

exports.createPost = async(req,res)=>{
    try{

        //cree
        const posts = new Posts({
            ...req.body
        })

        posts.save()
        return res.status(201).json({posts :posts})
    }catch(err){
        return res.status(500).json({err:err})
    }
}


exports.deletePost = async(req,res)=>{
    try{
        
        const posts = await Posts.deleteOne({
            _id:req.params.id
        })
        return res.status(201).json({posts :posts})
    }catch(err){
        return res.status(500).json({err:err})
    }
}