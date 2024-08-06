//CREATION DE MON APPLICATION 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const Auth_Router = require("./routes/route_auth");
const Photo_Router = require("./routes/route_photo");
const Reset_Router = require("./routes/route_reset");
const Posts_Router = require("./routes/route_posts");

// Configurer les middleware
app.use(cors());
app.use(express.json());

// Middleware pour servir les fichiers statiques
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/photos', express.static(path.join(__dirname, 'public/photos')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));

// Établir la connexion à la base de données
 mongoose.connect(process.env.URL_DATA_BASE)
 .then(()=>console.log("Base de donneés connectées"))
  .catch(()=>console.log("Echec de connection à la base des données"));

// Configurer les routes
app.use("/auth", Auth_Router);
app.use("/photo",Photo_Router)
app.use("/reset",Reset_Router)
app.use("/posts",Posts_Router)

module.exports = app;
