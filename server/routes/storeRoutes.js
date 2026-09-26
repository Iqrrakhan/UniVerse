const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// @route GET /api/store/:sellerId
router.get('/:sellerId', async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        storeName: true,
        createdAt: true
      }
    });
    if (!seller) return res.status(404).json({ message: 'Store not found' });

    const [products, reviews] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.findMany({
        where: { sellerId },
        include: {
          reviewer: { select: { id: true, name: true, department: true } },
          product: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ seller, products, reviews, avgRating });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;