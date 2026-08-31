var express = require('express');
const { userSignup, sendEmailOtp, verifyEmailOtp } = require('../controllers/user_signup');
const { createCustom, getCustom } = require('../controllers/custom');
const { authorize } = require('../middleware/auth');
const upload = require('../middleware/upload_multer');
const { getUserProfile } = require('../controllers/get_users');
const { logout } = require('../controllers/logout');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart');
const { getFavorites, toggleFavorite } = require('../controllers/favorite');
var router = express.Router();

router.post('/send-otp', sendEmailOtp);
router.post('/verify-otp', verifyEmailOtp);
router.post('/signup', userSignup);
router.post('/logout', authorize, logout);
router.get('/get-profile', authorize, getUserProfile);
router.post('/custom', authorize, upload.single("file"), createCustom);
router.get('/custom', authorize, getCustom);

router.get('/cart', authorize, getCart);
router.post('/cart', authorize, addToCart);
router.put('/cart/:itemId', authorize, updateCartItem);
router.delete('/cart/:itemId', authorize, removeFromCart);
router.delete('/cart', authorize, clearCart);

router.get('/favorites', authorize, getFavorites);
router.post('/favorites/:productId', authorize, toggleFavorite);

module.exports = router;
