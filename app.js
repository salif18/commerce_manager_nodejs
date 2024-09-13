//CREATION DE MON APPLICATION 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const Auth_Router = require("./routes/route_auth");
const Reset_Router = require("./routes/route_reset");
const Products_Router = require("./routes/route_products")
const Ventes_Router = require("./routes/route_ventes")
const Categories_Router = require("./routes/route_categories")
const Depenses_Router = require("./routes/route_depense")
const Fournisseurs_Router = require("./routes/route_fournisseurs")

// Configurer les middleware
// app.use(cors({
//   origin: ['https://smeckdev-vmanager.vercel.app', 'http://localhost:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods',
  'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());

// Middleware pour servir les fichiers statiques
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/photos', express.static(path.join(__dirname, 'public/photos')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));

// Établir la connexion à la base de données
mongoose.connect(process.env.DB_NAME)
  .then(() => console.log("Base de donneés connectées"))
  .catch(() => console.log("Echec de connection à la base des données"));

// Configurer les routes
app.use("/api/auth", Auth_Router);
app.use("/api/reset", Reset_Router)
app.use("/api/products", Products_Router)
app.use("/api/ventes", Ventes_Router)
app.use("/api/categories", Categories_Router)
app.use("/api/depenses", Depenses_Router)
app.use("/api/fournisseurs", Fournisseurs_Router)


module.exports = app;
