const express = require("express");
const Router = express.Router();

const Auth_Controller = require("../controller/auth_controller");


Router.post("/signup",Auth_Controller.registre);
Router.post("/login",Auth_Controller.login);

module.exports = Router;