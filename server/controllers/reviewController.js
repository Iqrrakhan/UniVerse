const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

/**
 * @route   POST /api/reviews
 * @desc    Create a review — purchase-gated (orderId required, order must be COMPLETED)
 * @access  Private (BUYER)
 */
const createReview = async (req, res, next) => {
  try {
    const { storefrontId, productId, orderId, rating, comment } = req.body;
    const authorId = req.user.id;

    // Verify the order exists, is completed, belongs to this buyer, and is for this storefront
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyerId: true, storefrontId: true, status: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found', code: 'NOT_FOUND' });
    }
    if (order.buyerId !== authorId) {
      return res.status(403).json({ message: 'You did not place this order', code: 'FORBIDDEN' });
    }
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({
        message: 'You can only review after an order is completed',
        code: 'ORDER_NOT_COMPLETED',
      });
    }
    if (order.storefrontId !== storefrontId) {
      return res.status(400).json({ message: 'Order does not match storefront', code: 'VALIDATION_ERROR' });
    }

    // Prevent duplicate reviews for the same order+product
    const existing = await prisma.review.findFirst({
      where: { orderId, productId, authorId },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this product for this order', code: 'CONFLICT' });
    }

    const review = await prisma.review.create({
      data: {
        authorId,
        storefrontId,
        productId,
        orderId,
        rating: Number(rating),
        comment,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        product: { select: { id: true, title: true } },
      },
    });

    logger.info({ reviewId: review.id, authorId, storefrontId }, 'Review created');
    res.status(201).json(review);
  } catch (error) {
    logger.error({ err: error }, 'Create review error');
    next(error);
  }
};

/**
 * @route   GET /api/reviews/storefront/:storefrontId
 * @desc    Get all reviews for a storefront
 * @access  Public
 */
const getStorefrontReviews = async (req, res, next) => {
  try {
    const { storefrontId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { storefrontId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    res.json({ reviews, avgRating: avgRating ? Number(avgRating) : null, total: reviews.length });
  } catch (error) {
    logger.error({ err: error }, 'Get storefront reviews error');
    next(error);
  }
};

/**
 * @route   PUT /api/reviews/:id/reply
 * @desc    Seller replies to a review
 * @access  Private (VENDOR — must be storefront owner)
 */
const replyToReview = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const { storefront } = req.user;

    if (!reply || reply.trim().length < 5) {
      return res.status(400).json({ message: 'Reply must be at least 5 characters', code: 'VALIDATION_ERROR' });
    }

    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found', code: 'NOT_FOUND' });
    }
    if (!storefront || review.storefrontId !== storefront.id) {
      return res.status(403).json({ message: 'Not authorized to reply to this review', code: 'FORBIDDEN' });
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { sellerReply: reply.trim(), repliedAt: new Date() },
    });

    res.json(updated);
  } catch (error) {
    logger.error({ err: error }, 'Review reply error');
    next(error);
  }
};

module.exports = { createReview, getStorefrontReviews, replyToReview };