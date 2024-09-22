const multer = require('multer');
const path = require('path');

module.exports = multer({
  storage:multer.diskStorage({}),
  fileFilter:(req,file,cb)=>{
    let ext = path.extname(file.originalname);
    if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png"){
      cb(new Error("erreur de type de fichier"),false);
      return ;
    }
    cb(null,true)
  }
})

// const MIME_TYPES = {
//   'image/jpg': 'jpg',
//   'image/jpeg': 'jpg',
//   'image/png': 'png', 
//   'image/ico': 'ico', 
//   'image/webp': 'png', 
// };

// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null,path.join(__dirname, '../public/images'));
//   },
//   filename: (req, file, callback) => {
//     const name = file.originalname.split(' ').join('_');
//     const extension = MIME_TYPES[file.mimetype];
//     callback(null, name + Date.now() + '.' + extension);
//   }
// });

// module.exports = multer({storage: storage}).single('image');

