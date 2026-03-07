const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Product = require('../models/Product');
const Review = require('../models/Review');

// @route GET /api/store/:sellerId
router.get('/:sellerId', async (req, res) => {
  try {
    const seller = await User.findById(req.params.sellerId).select('-password');
    if (!seller) return res.status(404).json({ message: 'Store not found' });

    const products = await Product.find({ seller: req.params.sellerId });
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name department')
      .populate('product', 'title');

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ seller, products, reviews, avgRating });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;