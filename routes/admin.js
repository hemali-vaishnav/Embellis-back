var express = require('express');
const { authorize } = require('../middleware/auth');
const isAdmin = require('../middleware/check_admin');
const upload = require('../middleware/upload_multer');
const { uploadCatalog, getCatalog } = require('../controllers/admin/upload_catalog');
const { makeAnAdmin } = require('../controllers/admin/make_an_admin');
const { getAllCustom } = require('../controllers/custom');
const { getAllUser } = require('../controllers/admin/get_all_user');
const { getAllCarts, getAllFavorites } = require('../controllers/admin/user_activity');
var router = express.Router();

router.post('/make-admin', authorize, isAdmin, makeAnAdmin);
router.post('/upload-catalog', authorize, isAdmin, upload.single("file"), uploadCatalog);
router.get('/get-catalog', authorize, isAdmin, getCatalog);
router.get('/get-all-users', authorize, isAdmin, getAllUser);
router.get('/custom', authorize, isAdmin, getAllCustom);
router.get('/carts', authorize, isAdmin, getAllCarts);
router.get('/favorites', authorize, isAdmin, getAllFavorites);

module.exports = router;
 