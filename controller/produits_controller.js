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

        return res.status(200).json({ message: "OK", produits, totalAchatOfAchat: totalAchat, stocks });
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
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: 'ID du produit manquant' });
        }

        const { nom, categories, prix_achat, prix_vente, stocks } = await req.body;

        // Trouver le produit existant
        const produit = await Produits.findById(id);

        if (!produit) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        // Mise à jour du produit avec les nouvelles valeurs
        const produitMisAJour = await Produits.findByIdAndUpdate(
            id,
            {
                nom: nom.length > 0 ? nom : produit.nom,
                categories: categories.length > 0 ? categories : produit.categories,
                prix_achat: prix_achat.length > 0 ? prix_achat : produit.prix_achat,
                prix_vente: prix_vente.length > 0 ? prix_vente : produit.prix_vente,
                stocks: stocks.length > 0 ? stocks : produit.stocks
            },
            { new: true } // retourne le document mis à jour
        );

        return res.status(200).json(
            { message: 'Modifié !!', results: produitMisAJour },
        );

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

        return res.status(200).json({ message: 'Supprimé !!', results: produit });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};



// exports.update = async (req, res) => {
//   try {
//     // Construction de l'objet newProd avec l'image si elle existe
//     const newProd = req.file ? {
//       ...req.body,
//       image: ${req.protocol}://${req.get('host')}/images/${req.file.filename}
//     } : {
//       ...req.body
//     };

//     // Vérification si le produit existe
//     const product = await Product.findOne({ _id: req.params.id });

//     if (!product) {
//       return res.status(404).json({
//         message: 'Produit non trouvé'
//       });
//     }

//     // Vérification d'autorisation
//     if (product.userId.toString() !== req.auth.userId) {
//       return res.status(401).json({
//         message: 'Non autorisé'
//       });
//     }

//     // Mise à jour du produit
//     const updatedProduct = await Product.findOneAndUpdate(
//       { _id: req.params.id, userId: req.auth.userId },
//       { ...newProd },
//       { new: true } // Renvoie le produit mis à jour
//     );

//     if (!updatedProduct) {
//       return res.status(400).json({
//         message: 'Erreur lors de la mise à jour du produit'
//       });
//     }

//     return res.status(200).json({
//       message: 'Produit mis à jour avec succès',
//       product: updatedProduct
//     });

//   } catch (err) {
//     return res.status(500).json({
//       err: err.message || 'Erreur serveur'
//     });
//   }
// };



// exports.delete = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const product = await Products.findOne({ _id: id });
  
//       if (!product) {
//         return res.status(404).json({ message: 'Produit non trouvé' });
//       }
  
//       if (product.userId.toString() !== req.auth.userId) {
//         return res.status(401).json({ message: 'Non autorisé' });
//       }
  
//       const filename = product.image.split('/images/')[1];
  
//       // Supprimer l'image du serveur
//       fs.unlink(`public/images/${filename}`, async (err) => {
//         if (err) {
//           return res.status(500).json({ message: "Erreur lors de la suppression de l'image", error: err });
//         }
  
//         // Supprimer le produit après avoir supprimé l'image
//         await product.deleteOne({ _id: id });
//         return res.status(200).json({ message: 'Produit supprimé avec succès' });
//       });
  
//     } catch (err) {
//       return res.status(500).json({ message: 'Erreur serveur', error: err.message });
//     }
//   };
  