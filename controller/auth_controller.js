require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/user_model");

// Durée de blocage en millisecondes (1 heure)
const BLOCK_DURATION = 5 * 60 * 1000;

// Nombre maximal de tentatives
const TENTATIVES_MAX = 5;

//FONCTION D'ENREGISTREMENT DES UTILISATEURS
exports.registre = async (req, res) => {
  try {
    const { numero, email, password } = req.body;

    // Vérifiez si l'utilisateur existe
    const userExiste = await Users.findOne({
      $or: [
        { numero: numero },
        { email: email }
      ]
    });

    if (userExiste) {
      return res.status(401).json({
        message: "User existe"
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un instance du model user
    const user = new Users({
      ...req.body,
      password: hashedPassword
    });

    // Enregistrer l'utilisateur
    await user.save();

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Envoyer la réponse
    return res.status(201).json({
      token: token,
      usser: user
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// FONCTION DE CONNEXION DES UTILISATEURS
exports.login = async (req, res) => {
  try {
    const { contacts, password } = req.body;

    const user = await Users.findOne({
      $or: [
        { numero: contacts },
        { email: contacts }
      ]
    }).populate("photo"); // Assurez-vous que 'photo' est correct

    if (!user) {
      return res.status(400).json({
        message: "Votre email ou numéro est incorrect"
      });
    }

    // Vérifier si l'utilisateur  a atteint le nombre maximum de tentatives et le bloqué
    if (user.tentatives >= TENTATIVES_MAX && user.tentativesExpires > Date.now()) {
      // Convertir 'tentativesExpires' en heure locale
      const tempsDattente = new Date(user.tentativesExpires).toLocaleString();
      return res.status(429).json({
        message: `Nombre maximal de tentatives atteint. Veuillez réessayer après ${tempsDattente.split(" ")[1]}.`
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      // Incrémenter les tentatives
      user.tentatives += 1;  
      if (user.tentatives >= TENTATIVES_MAX) {
        // Définir l'expiration si les tentatives maximales sont atteintes
        user.tentativesExpires = Date.now() + BLOCK_DURATION;  
      }
      await user.save();
      return res.status(401).json({
        message: "Votre mot de passe est incorrect"
      });
    }
    // Réinitialiser les tentatives en cas de succès
    user.tentatives = 0;  
    // Réinitialiser l'expiration
    user.tentativesExpires = Date.now();  

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    await user.save();

    return res.status(200).json({
      token: token,
      user: user
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};