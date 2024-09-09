const Produits = require("../models/produits_model");
const fs = require('fs');

exports.create = async (req, res, next) => {
    try {
        console.log(req.file)
        console.log(req.body)
        // Création d'un nouvel objet produit
        const nouveauProduit = new Produits({
            ...req.body,
             image:req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : null,
            userId: req.auth.userId // Associer le produit à l'utilisateur
        });

        // Sauvegarde du produit dans la base de données
        const produitSauvegarde = await nouveauProduit.save();

        // Retourner une réponse avec le produit sauvegardé
        return res.status(201).json({ message: "Ajouté", produitSauvegarde });
    } catch (err) {

        return res.status(500).json({ message: "Erreur", error: err.message });
    }
};

exports.getProduits = async (req, res) => {
    try {

        const { userId } = req.params

        if (!userId) {
            return res.status(400).json(
                { message: 'userId est requis' },
            );
        }

        const produits = await Produits.find({ userId }).sort({ date_achat: -1 });
        const totalAchat = produits.map((x) => x.prix_achat * x.stocks).reduce((a, b) => a + b, 0);

        // Calcule le nombre total de stocks
        const stocks = produits.reduce((acc, item) => acc + (item?.stocks || 0), 0);

        return res.status(200).json({ message: "OK", produits:produits, totalAchatOfAchat: totalAchat, stocks });
    } catch (err) {
        return res.status(500).json({ message: "Erreur", error: err.message }, { status: 500 });
    }
};

exports.getOneProduits = async (req, res) => {
    try {
        const { id } = req.params

        const produit = await Produits.findById(id);

        if (!produit) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        return res.status(200).json({ message: 'ok', results: produit });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


exports.update = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'ID du produit manquant' });
        }

        const { nom, categories, prix_achat, prix_vente, stocks } = req.body;

        // Trouver le produit existant
        const produit = await Produits.findById(id);

        if (!produit) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        // Vérification d'autorisation
        if (produit.userId.toString() !== req.auth.userId) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        // Mise à jour du produit avec les nouvelles valeurs
        const produitMisAJour = await Produits.findByIdAndUpdate(
            id,
            {
                nom: nom ? nom : produit.nom,
                image: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : produit.image,
                categories: categories ? categories : produit.categories,
                prix_achat: typeof prix_achat !== 'undefined' ? prix_achat : produit.prix_achat,
                prix_vente: typeof prix_vente !== 'undefined' ? prix_vente : produit.prix_vente,
                stocks: typeof stocks !== 'undefined' ? stocks : produit.stocks
            },
            { new: true } // retourne le document mis à jour
        );

        if (!produitMisAJour) {
            return res.status(400).json({ message: 'Erreur lors de la mise à jour du produit' });
        }

        return res.status(200).json({ message: 'Produit modifié avec succès', results: produitMisAJour });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


exports.delete= async (req, res) => {
    try {

        const { id } = req.params
        const produit = await Produits.findByIdAndDelete(id);

        if (!produit) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

         
      if (produit.userId.toString() !== req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé' });
      }
  
      const filename = produit.image.split('/images/')[1];
  
      // Supprimer l'image du serveur
      fs.unlink(`public/images/${filename}`, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la suppression de l'image", error: err });
        }
  
        // Supprimer le produit après avoir supprimé l'image
        await produit.deleteOne({ _id: id });
        return res.status(200).json({ message: 'Produit supprimé avec succès' });
      });

        return res.status(200).json({ message: 'Supprimé !!', results: produit });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
