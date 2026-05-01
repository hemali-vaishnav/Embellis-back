var express = require('express');
const { authorize } = require('../middleware/auth');
const isAdmin = require('../middleware/check_admin');
const upload = require('../middleware/upload_multer');
const { uploadCatalog } = require('../controllers/admin/upload_catalog');
const { makeAnAdmin } = require('../controllers/admin/make_an_admin');
const { getAllCustom } = require('../controllers/custom');
var router = express.Router();

router.post('/make-admin', authorize, isAdmin, makeAnAdmin);
router.post('/upload-catalog', authorize, isAdmin, upload.single("file"), uploadCatalog);
router.get('/custom', authorize, isAdmin, getAllCustom);

module.exports = router;
