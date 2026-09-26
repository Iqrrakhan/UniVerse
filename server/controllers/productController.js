const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const { cloudinary } = require('../config/cloudinary');

/**
 * @route   POST /api/products
 * @desc    Create a new product listing
 * @access  Private (VENDOR only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { title, description, basePrice, itemType, categoryId, tags, stockCount, metadata } = req.body;
    const user = req.user;

    // User must have a storefront
    if (!user.storefront) {
      return res.status(400).json({ message: 'You must create a storefront before listing products', code: 'NO_STOREFRONT' });
    }

    // Handle image upload
    let imageUrl = '';
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'universe-marketplace',
      });
      imageUrl = result.secure_url;
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);

    // Ensure unique slug within storefront
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { storefrontId_slug: { storefrontId: user.storefront.id, slug: finalSlug } } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        storefrontId: user.storefront.id,
        categoryId: categoryId || (await prisma.storefront.findUnique({ where: { id: user.storefront.id } })).categoryId,
        title,
        slug: finalSlug,
        description,
        basePrice: Number(basePrice),
        itemType: itemType || 'PHYSICAL',
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        stockCount: stockCount ? Number(stockCount) : null,
        metadata: metadata || null,
        ...(imageUrl && {
          images: {
            create: { url: imageUrl, altText: title, sortOrder: 0 },
          },
        }),
      },
      include: {
        images: true,
        storefront: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            owner: {
              select: { id: true, name: true },
            },
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    logger.info({ productId: product.id, storefrontId: user.storefront.id }, 'Product created');

    res.status(201).json(product);
  } catch (error) {
    logger.error({ err: error }, 'Product creation error');
    next(error);
  }
};

/**
 * @route   GET /api/products
 * @desc    Get all active products (with filters)
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, search, itemType, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      isActive: true,
      storefront: { status: 'ACTIVE' },
    };

    if (category) {
      where.category = { slug: category };
    }
    if (itemType) {
      where.itemType = itemType;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          storefront: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              owner: {
                select: { id: true, name: true, verificationTier: true },
              },
            },
          },
          category: {
            select: { id: true, name: true, slug: true, storefrontLabel: true },
          },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Get products error');
    next(error);
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } },
        storefront: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            logoUrl: true,
            themeColor: true,
            owner: {
              select: { id: true, name: true, verificationTier: true },
            },
          },
        },
        category: true,
        reviews: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, orderItems: true } },
      },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' });
    }

    res.json(product);
  } catch (error) {
    logger.error({ err: error }, 'Get product error');
    next(error);
  }
};

/**
 * @route   PATCH /api/products/:id
 * @desc    Update a product (toggle isPinned, stock, details)
 * @access  Private (Vendor owner)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { storefront: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' });
    }

    if (existing.storefront.ownerId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to edit this product', code: 'FORBIDDEN' });
    }

    const { isPinned, inStock, basePrice, title, description } = req.body;
    const data = {};
    if (isPinned !== undefined) data.isPinned = Boolean(isPinned);
    if (inStock !== undefined) data.inStock = Boolean(inStock);
    if (basePrice !== undefined) data.basePrice = Number(basePrice);
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        storefront: { select: { id: true, handle: true, displayName: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error({ err: error }, 'Update product error');
    next(error);
  }
};

module.exports = { createProduct, getProducts, getProduct, updateProduct };