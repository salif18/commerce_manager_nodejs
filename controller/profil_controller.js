const fs = require("fs")
const path = require("path")
const Photo = require("../models/profil_photo_model");

exports.postPhoto = async (req, res) => {
    try {

        //VERIFIER SI LE FICHIER EST PRESENT AVANT DE PASSER A TOUTES AUTRES OPERATIONS
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        //RECUPERER LE NOM ORINALE DE LA PHOTO
        const photoOriginalName = req.file.filename;

        //CREER UNE NOUVELLE INSTANCE DU MODEL PHOTO
        const photo = new Photo({
            ...req.body,
            photo: `${req.protocol}://${req.get('host')}/images/${photoOriginalName}`
        });

        //ENREGISTREMENT DANS LA BASE DE DONNEES
        await photo.save();
        return res.status(201).json({ 
            message: "Photo ajoutée" 
        });

    } catch (err) {
        // Amélioration de la réponse d'erreur
        return res.status(500).json({ 
            err: err.message || 'Erreur serveur' 
        }); 
    }
};
