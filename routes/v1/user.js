const express = require('express');
const { createUser, loginUser, userLogout, forgetPassword, resetpassword } = require('../../controller/user'); // Adjust path as necessary
const upload = require('../../middleware/multer');

const router = express.Router();

router.post('/users', upload.single('avatar'),createUser); // Use the middleware function
router.post('/login', loginUser); // Use the middleware function
router.get('/logout', userLogout); // Use the middleware function
router.post('/forgot',forgetPassword);
router.put('/resetpassword/:resetToken',resetpassword)
module.exports = router;
