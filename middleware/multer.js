const multer = require('multer');

const storage = multer.diskStorage({
    
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        console.log("runig")
        console.log(file)
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + unique+file.originalname); // Use file.fieldname instead of file.filename
    }
});

const upload = multer({ storage: storage });
module.exports = upload;
