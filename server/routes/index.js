const express = require('express');
const router = express.Router();

const distributionRoutes = require('./distribution');
const inventoryRoutes = require('./inventory');

// router.use('/api/v1/products', productRoutes);
router.use('/api/v1/distribution', distributionRoutes);
router.use('/api/v1/inventory', inventoryRoutes);

module.exports = router;
