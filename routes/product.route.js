const express = require('express');
const { addProduct } = require('../controllers/product.controller');
const upload = require('../config/multerConfig');
const productRouter = express.Router();


// adminRoutes
productRouter.post('/admin/product/new', upload.fields([
    { name: "images", maxCount: 5 } 
]), addProduct);

module.exports = productRouter;