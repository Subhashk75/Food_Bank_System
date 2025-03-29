const mongoose = require('mongoose');
const Category = require('../models/Category');

// Predefined categories using valid MongoDB ObjectIds
const defaultCategories = [
  { _id: new mongoose.Types.ObjectId(), name: 'Fruits' },
  { _id: new mongoose.Types.ObjectId(), name: 'Vegetables' },
  { _id: new mongoose.Types.ObjectId(), name: 'Dairy' },
  { _id: new mongoose.Types.ObjectId(), name: 'Meat' },
  { _id: new mongoose.Types.ObjectId(), name: 'Grains' },
  { _id: new mongoose.Types.ObjectId(), name: 'Beverages' },
];

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    if (categories.length === 0) {
      // If database is empty, insert predefined categories
      await Category.insertMany(defaultCategories);
      return res.json(defaultCategories);
    } else {
      return res.json(categories);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};
