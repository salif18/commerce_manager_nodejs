const mongoose = require("mongoose");

const schema = mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produits' },
        nom: { type: String },
        categories: { type: String },
        prix_achat: { type: Number },
        prix_vente: { type: Number },
        stocks: { type: Number },
        qty: { type: Number },
        date_vente: { type: Date }
    }, { timestamps: true });
    
module.exports = mongoose.model("Ventes", schema);

