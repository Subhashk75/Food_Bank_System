const express = require('express');
const { 
    addProduct, 
    getProducts, 
    searchProduct, 
    modifyProduct, 
    deleteProduct, 
    subtractProductQuantity // Corrected from subtractProductQuantity
} = require('../controllers/productController');

console.log("addProduct:", addProduct); // Debug log to ensure it’s not undefined
const router = express.Router();

// Routes (prefixed with /api/v1 in server.js)
router.post('/products', addProduct); // POST /api/v1/products
router.get('/products', getProducts); // GET /api/v1/products
router.get('/searchProduct', searchProduct); // GET /api/v1/searchProduct
router.put('/products/:id', modifyProduct); // PUT /api/v1/products/:id
router.delete('/products/:id', deleteProduct); // DELETE /api/v1/products/:id
router.post('/subtractQuantity', subtractProductQuantity); // POST /api/v1/subtractQuantity

module.exports = router;