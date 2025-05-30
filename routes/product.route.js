const express = require('express');
const { addProduct, getProducts, updateProduct } = require('../controllers/product.controller');
const upload = require('../config/multerConfig');
const productRouter = express.Router();


// adminRoutes
productRouter.post('/admin/product/new', upload.fields([
    { name: "images", maxCount: 5 } 
]), addProduct);

productRouter.put('/admin/product/:id', upload.fields([
    { name: "images", maxCount: 5 } 
]), updateProduct);
productRouter.get('/products',getProducts);
module.exports = productRouter;