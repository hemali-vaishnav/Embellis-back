var express = require('express');
const { userSignup } = require('../controllers/user_signup');
const { userLogin } = require('../controllers/user_login');
var router = express.Router();

router.post('/signup', userSignup);
router.post('/login', userLogin);

module.exports = router;