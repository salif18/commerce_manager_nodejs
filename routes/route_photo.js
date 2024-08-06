const express = require("express");
const Router = express.Router();
const PhotoController = require("../controller/profil_controller");
const middlewareImages = require("../middlewares/ImageMiddleware");

Router.post("/", middlewareImages, PhotoController.postPhoto);


module.exports = Router;