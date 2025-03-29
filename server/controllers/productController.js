const Product = require('../models/Product');
const mongoose = require('mongoose');
const Category = require('../models/Category');
// @desc   Add a new product
// @route  POST /api/v1/products
// @access Public


exports.addProduct = async (req, res) => {
    try {
        console.log("Received request to add product:", req.body);

        const { name, description, image, quantity, categoryId } = req.body;

        // Validate categoryId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId format. Must be a valid ObjectId." });
        }

        const categoryObjectId = new mongoose.Types.ObjectId(categoryId);

        // Ensure the category exists before assigning it
        const categoryExists = await Category.findById(categoryObjectId);
        if (!categoryExists) {
            return res.status(404).json({ message: "Category not found" });
        }

        const product = new Product({
            name,
            description,
            image,
            quantity,
            category: categoryObjectId
        });

        await product.save();

        // Add the product to the category's product list
        await Category.findByIdAndUpdate(categoryObjectId, { $push: { products: product._id } });

        res.status(201).json({ message: "Product added successfully", product });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Server error while adding product", error: error.message });
    }
};



// @desc   Get all products
// @route  GET /api/v1/products
// @access Public
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

// @desc   Search products by name
// @route  GET /api/v1/searchProduct
// @access Public
exports.searchProduct = async (req, res) => {
    try {
        const query = req.query.name;
        const products = await Product.find({ name: new RegExp(query, 'i') });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error searching products", error: error.message });
    }
};

// @desc   Update product details
// @route  PUT /api/v1/products/:id
// @access Public
exports.modifyProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, image, quantity, category } = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { name, description, image, quantity, category },
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

// @desc   Delete a product
// @route  DELETE /api/v1/products/:id
// @access Public
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

// @desc   Modify product quantity (add/subtract)
// @route  POST /api/v1/subtractQuantity
// @access Public
exports.addProductQuantity = async (req, res) => {
    try {
        const { productId, quantity, unit } = req.body;

        if (!Number.isFinite(quantity) || !Number.isFinite(unit)) {
            return res.status(400).json({ error: "Invalid quantity or unit." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        product.quantity += quantity * unit;
        await product.save();

        res.json({ message: "Product quantity added successfully.", product });
    } catch (error) {
        res.status(500).json({ error: error.message || "Error adding product quantity." });
    }
};

exports.subtractProductQuantity = async (req, res) => {
    try {
        const { productId, quantity, unit } = req.body;

        if (!Number.isFinite(quantity) || !Number.isFinite(unit)) {
            return res.status(400).json({ error: "Invalid quantity or unit." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        product.quantity = Math.max(0, product.quantity - quantity * unit);
        await product.save();

        res.json({ message: "Product quantity subtracted successfully.", product });
    } catch (error) {
        res.status(500).json({ error: error.message || "Error subtracting product quantity." });
    }
};
