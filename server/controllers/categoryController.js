const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

/**
 * @route   GET /api/categories
 * @desc    List all active categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { storefronts: true } },
      },
    });
    res.json(categories);
  } catch (error) {
    logger.error({ err: error }, 'Get categories error');
    next(error);
  }
};

/**
 * @route   GET /api/categories/:slug
 * @desc    Get a single category with its storefronts
 * @access  Public
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        storefronts: {
          where: { status: 'ACTIVE' },
          include: {
            owner: { select: { id: true, name: true, verificationTier: true } },
            _count: { select: { products: true, followers: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { storefronts: true } },
      },
    });

    if (!category || !category.isActive) {
      return res.status(404).json({ message: 'Category not found', code: 'NOT_FOUND' });
    }
    res.json(category);
  } catch (error) {
    logger.error({ err: error }, 'Get category error');
    next(error);
  }
};

module.exports = { getCategories, getCategoryBySlug };
