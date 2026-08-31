var express = require('express');
var router = express.Router();
const { getProducts, getProductById } = require('../controllers/product');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/products', getProducts);
router.get('/products/:id', getProductById);

module.exports = router;
