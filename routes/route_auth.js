const express = require("express");
const Router = express.Router();

const Auth_Controller = require("../controller/auth_controller");
const middleware = require("../middlewares/AuthMiddleware");


Router.post("/registre",Auth_Controller.registre);
Router.post("/login",Auth_Controller.login);
Router.post("/logout",middleware,Auth_Controller.logout);

module.exports = Router;