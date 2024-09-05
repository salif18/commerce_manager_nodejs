const express = require("express");
const Router = express.Router();

const Ventes_Controller = require("../controller/ventes_controller");
const middleware = require("../middlewares/AuthMiddleware");

Router.post("/",middleware,Ventes_Controller.create);
Router.get("/:userId",middleware,Ventes_Controller.getVentes);
Router.get("/stats-by-categories/:userId",middleware,Ventes_Controller.getStatsByCategories);
Router.get("/stats-by-hebdo/:userId",middleware,Ventes_Controller.getStatsHebdo);
Router.get("/stats-by-month/:userId",middleware,Ventes_Controller.getStatsByMonth);
Router.delete("/single/:id",middleware,Ventes_Controller.delete);

module.exports = Router;