const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Tech', 'Arts', 'Tutoring', 'Food', 'Other'] 
  },
  itemType: { 
    type: String, 
    required: true, 
    enum: ['physical', 'service'] // Distinguishes between a flower and a lesson
  },
  image: { type: String, default: '' }, // We will use Cloudinary for this later
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);