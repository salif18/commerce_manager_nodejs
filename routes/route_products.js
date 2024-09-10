const express = require("express");
const Router = express.Router();

const Product_Controller = require("../controller/produits_controller");
const middleware = require("../middlewares/AuthMiddleware");
const uploadFile = require("../middlewares/ImageMiddleware")

Router.post("/",middleware,uploadFile,Product_Controller.create);
Router.get("/:userId",middleware,Product_Controller.getProduits);
Router.get("/single/:id",middleware,Product_Controller.getOneProduits);
Router.put("/single/:id",middleware,uploadFile,Product_Controller.update);
Router.delete("/single/:id",middleware,Product_Controller.delete);

module.exports = Router;