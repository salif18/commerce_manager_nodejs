const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png', 
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null,path.join(__dirname, '../public/images'));
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');
// require("dotenv").config()
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'produits', // Vous pouvez choisir un nom de dossier
//     format: async (req, file) => {
//       const ext = file.mimetype.split('/')[1];
//       return ext === 'jpeg' ? 'jpg' : ext; // convertit les fichiers jpeg en jpg
//     },
//     public_id: (req, file) => file.originalname.split(' ').join('_') + Date.now(), // Nom unique basé sur l'original et le timestamp
//   },
// });

// module.exports = multer({ storage: storage }).single('image');
