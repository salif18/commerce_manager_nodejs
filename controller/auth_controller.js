require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/user_model");


//FONCTION D'ENREGISTREMENT DES UTILISATEURS
exports.registre = async (req, res) => {
  try {
    const { name, numero, email, password } = req.body;

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
      usser:user
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// FONCTION DE CONNECTION DES UTILISATEURS
exports.login = async (req, res) => {
  try {
    const { contacts, password } = await req.body;

    const user = await Users.findOne({
      $or: [
        { numero: contacts }, 
        { email: contacts }
      ]
    }).populate("photo") // Assurez-vous que 'photo' est correct


    if (!user) {
      return res.status(400).json({ 
        message: "Votre email ou numero est incorrect" 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(404).json({ 
        message: "Votre mot de passe est incorrect" 
      });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.SECRET_KEY, 
      { expiresIn: "24h" }
    );

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
