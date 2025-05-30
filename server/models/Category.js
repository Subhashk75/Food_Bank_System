const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product' // Reference to Product model
        }
    ]
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
