var express = require('express');
const { userSignup } = require('../controllers/user_signup');
const { userLogin } = require('../controllers/user_login');
const { createCustom, getCustom } = require('../controllers/custom');
const { authorize } = require('../middleware/auth');
const upload = require('../middleware/upload_multer');
var router = express.Router();

router.post('/signup', userSignup);
router.post('/login', userLogin);
router.post('/custom', authorize, upload.single("file"), createCustom);
router.get('/custom', authorize, getCustom);

module.exports = router;
