require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const Users = require("../models/user_model");

const revokedTokens = []

// Durée de blocage en millisecondes (1 heure)
const BLOCK_DURATION = 5 * 60 * 1000;

// Nombre maximal de tentatives
const TENTATIVES_MAX = 5;

//FONCTION D'ENREGISTREMENT DES UTILISATEURS
exports.registre = async (req, res) => {
  try {
    const { name , boutique_name , numero, email, password } = req.body;

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
// Hacher un mot de passe
const salt = bcrypt.genSaltSync(10);
    // Hacher le mot de passe
    const hashedPassword =  bcrypt.hashSync(password, salt);

    // Créer un instance du model user
    const user = new Users({name,  boutique_name, numero , email,password: hashedPassword});

    console.log(user)

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
      userId: user._id,
      userName:user.name,
      entreprise:user.boutique_name,
      message:"user creer"
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// FONCTION DE CONNEXION DES UTILISATEURS
exports.login = async (req, res) => {
  try {
    const { contacts, password } = req.body;
    console.log(req.body)
    const user = await Users.findOne({
      $or: [
        { numero: contacts },
        { email: contacts }
      ]
    })

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

    const validPassword = bcrypt.compareSync(password, user.password);

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
      userId: user._id,
      userName:user.name,
      entreprise:user.boutique_name,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  try {
    // Récupérer le token dans l'entête
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    // Ajouter le token à la liste des tokens révoqués
    revokedTokens.push(token);

    return res.status(200).json({ message: "deconnecté" })

  } catch (err) {
    return res.status(500).json({ err: err })
  }
}