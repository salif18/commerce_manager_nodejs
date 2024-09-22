const mongoose = require("mongoose");

const schema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    cloudinaryId: { type: String },
    image: { type: String },
    nom: { type: String, required: true },
    categories: { type: String, required: true },
    prix_achat: { type: Number, required: true },
    prix_vente: { type: Number, required: true },
    stocks: { type: Number, required: true },
    date_achat: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Produits", schema);

