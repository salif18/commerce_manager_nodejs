const express = require("express");
const Router = express.Router();
const middlewareAuth = require("../middlewares/AuthMiddleware")
const Post_Controller = require("../controller/post_controller");


Router.post("/",middlewareAuth,Post_Controller.createPost);
Router.delete("/id",middlewareAuth,Post_Controller.deletePost);

module.exports = Router;