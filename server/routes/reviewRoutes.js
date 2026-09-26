const express = require('express');
const router = express.Router();
const { createReview, getStorefrontReviews, replyToReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/storefront/:storefrontId', getStorefrontReviews);
router.put('/:id/reply', protect, replyToReview);

module.exports = router;