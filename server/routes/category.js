const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');

const router = express.Router();

router.get('/getCategories', getCategories);
router.post('/CreateCategories', createCategory);

module.exports = router;
