const multer = require("multer");

// Extensions MIME
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

// Configuration de stockage
const storage = multer.diskStorage({
    // Assurez-vous que le dossier ./public/images existe
    destination: (req, file, callback) => {
        callback(null, "./public/images"); 
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + "." + extension);
    }
});

module.exports = multer({ storage: storage }).single("photo");
