const Vente = require("../models/ventes_model")
const Produits = require("../models/produits_model");
const moment = require("moment");
const  mongoose = require("mongoose");


exports.create = async (req, res, next) => {
    const { userId, _id, nom, categories, prix_achat, prix_vente, stocks, qty, date_vente } = await req.body;

    try {
        // Trouver le produit associé à la vente
        const product = await Produits.findById(_id); // Pas besoin d'encapsuler _id dans un objet

        if (!product) {
            return res.status(404).json(
                { message: 'Produit non trouvé' },
            );
        }

        // Vérifier si le stock est suffisant
        if (qty > 0 && qty <= product.stocks) {
            // Créer la vente avec le productId assigné correctement
            const vente = new Vente({
                userId,
                productId: product._id, // Conversion en chaîne de caractères
                nom,
                categories,
                prix_achat,
                prix_vente,
                stocks,
                qty,
                date_vente: date_vente ? date_vente : new Date()
            });

            console.log("Objet Vente créé------->:", vente); // Afficher l'objet vente complet

            const savedVente = await vente.save();

            // Mettre à jour le stock du produit
            product.stocks -= qty;
            await product.save();
            console.log("Objet Vente saved----->:", savedVente);
            return res.status(201).json(
                { message: 'Vente effectuée !!', results: savedVente },
            );
        } else {
            return res.status(400).json(
                { message: `${nom} insuffisant ` },
            );
        }

    } catch (err) {
        return res.status(500).json(
            { message: 'Erreur lors de la sauvegarde de la vente', error: err },
        );
    }
};

// Route pour obtenir toutes les ventes
exports.getVentes = async (req, res , next) => {
    try {
        const { userId } = req.params

        if (!userId) {
            returnres.status(404).json(
                { message: 'userId est requis' },
            );
        }
        //   RECUPERER LES VENTES
        const ventes = await Vente.find({ userId }).sort({ date_vente: -1 });

        // CALCULE DES SOMMES
        const totalAchat = ventes.map((x) => x.prix_achat * x.qty).reduce((a, b) => a + b, 0);
        const totalVente = ventes.map((x) => x.prix_vente * x.qty).reduce((a, b) => a + b, 0);

        // CALCULE DE BENEFICE
        const beneficeTotal = ventes.reduce((acc, x) => {
            return acc + ((x.prix_vente - x.prix_achat) * x.qty);
        }, 0);


        return res.status(200).json(
            {
                message: "ok",
                results: ventes,
                total_vente: totalVente,
                benefice_total: beneficeTotal,
                totalAchatOfVente: totalAchat
            },

        );
    } catch (err) {
        return res.status(500).json(
            { message: "Erreur lors de la récupération des ventes", error: err },

        );
    }
};


exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params
        // Trouver la vente par ID
        const vente = await Vente.findById(id);

        if (!vente) {
            return res.status(404).json({ message: 'Vente non trouvée' });
        }

        // Trouver le produit associé à la vente
        const product = await Produits.findById(vente.productId);

        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        // Mettre à jour le stock du produit en ajoutant la quantité annulée
        product.stocks += vente.qty;
        await product.save();

        // Supprimer la vente
        await vente.deleteOne();

        return res.status(200).json(
            { message: 'Annulée !!', results: vente },
        );

    } catch (err) {
        return res.status(500).json(
            { message: 'Erreur lors de l\'annulation de la vente', error: err.message },
        );
    }
};

exports.getStatsByCategories = async (req, res, next) => {
    try {
        const { userId } = req.params

        if (!userId) {
            return res.status(400).json(
                { message: 'userId est requis' },
            );
        }
        const results = await Vente.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: { nom: "$nom", categories: "$categories" },
                    total_vendu: { $sum: "$qty" }
                }
            },
            {
                $sort: { total_vendu: -1 } // Trier par total_vendu en ordre décroissant
            }
        ]);

        return res.status(200).json(
            { message: 'ok', results:results },
        );
    } catch (err) {
        return res.status(500).json(
            { error: 'Une erreur s\'est produite lors de la récupération des statistiques de vente.', message: err.message },
        );
    }
};

exports.getStatsHebdo = async (req, res, next) => {

    try {

        const { userId } = req.params

        const startOfWeek = moment().startOf('isoWeek').toDate();
        const endOfWeek = moment().endOf('isoWeek').toDate();

        let data = [];
        let currentDate = moment(startOfWeek);

        while (currentDate <= endOfWeek) {
            const total = await Vente.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        date_vente: {
                            $gte: currentDate.toDate(),
                            $lt: currentDate.clone().add(1, 'days').toDate(),
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$prix_vente" },
                    },
                },
            ]);

            data.push({
                date: currentDate.format('DD-MM-YYYY'),
                total: total.length > 0 ? total[0].total : 0,
            });

            currentDate.add(1, 'day');
        }

        const totalHebdomendaire = await Vente.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date_vente: {
                        $gte: startOfWeek,
                        $lte: endOfWeek,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$prix_vente" },
                },
            },
        ]);

        return res.status(200).json({
            stats: data,
            totalHebdo: totalHebdomendaire.length > 0 ? totalHebdomendaire[0].total : 0,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message,
        });
    }
};

exports.getStatsByMonth = async (req, res, next) => {
    try {
        const { userId } = req.params

        if (!userId) {
            return res.status(400).json(
                { message: 'userId est requis' },
            );
        }

        const results = await Vente.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: {
                        annee: { $year: "$date_vente" },
                        mois: { $month: "$date_vente" }
                    },
                    nombre_ventes: { $sum: 1 },
                    total_ventes: { $sum: { $multiply: ["$prix_vente", "$qty"] } }
                }
            },
            {
                $sort: { "_id.annee": 1, "_id.mois": 1 }
            },
            {
                $project: {
                    _id: 0,
                    annee: "$_id.annee",
                    mois: "$_id.mois",
                    nombre_ventes: 1,
                    total_ventes: 1
                }
            }
        ]);

        return res.status(200).json(
            { message: 'ok', results },

        );
    } catch (err) {
        return res.status(500).json(
            { error: 'Une erreur s\'est produite lors de la récupération des statistiques de vente.', message: err.message },

        );
    }
};








