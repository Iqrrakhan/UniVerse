const Review = require('../models/Review');

// @route POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { seller, product, rating, comment } = req.body;

    const review = await Review.create({
      reviewer: req.user.id,
      seller,
      product,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// @route GET /api/reviews/seller/:sellerId
exports.getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name department')
      .populate('product', 'title');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};