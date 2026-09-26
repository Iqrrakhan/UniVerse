const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

/**
 * @route   POST /api/storefronts
 * @desc    Create a storefront for the logged-in vendor
 * @access  Private (VENDOR)
 */
const createStorefront = async (req, res, next) => {
  try {
    const { handle, displayName, tagline, description, categoryId, themeColor, accentColor } = req.body;
    const ownerId = req.user.id;

    // User can only have one storefront
    if (req.user.storefront) {
      return res.status(409).json({ message: 'You already have a storefront', code: 'CONFLICT' });
    }

    // Validate category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || !category.isActive) {
      return res.status(400).json({ message: 'Invalid category selected', code: 'VALIDATION_ERROR' });
    }

    // Check handle uniqueness
    const handleTaken = await prisma.storefront.findUnique({ where: { handle } });
    if (handleTaken) {
      return res.status(409).json({ message: `@${handle} is already taken. Try another.`, code: 'CONFLICT' });
    }

    const storefront = await prisma.storefront.create({
      data: {
        ownerId,
        handle,
        displayName,
        tagline: tagline || null,
        description: description || null,
        categoryId,
        themeColor: themeColor || '#06b6d4',
        accentColor: accentColor || '#a855f7',
      },
      include: {
        category: true,
        owner: { select: { id: true, name: true, email: true, verificationTier: true } },
        _count: { select: { products: true, followers: true, reviews: true } },
      },
    });

    logger.info({ storefrontId: storefront.id, handle, ownerId }, 'Storefront created');
    res.status(201).json(storefront);
  } catch (error) {
    logger.error({ err: error }, 'Create storefront error');
    next(error);
  }
};

/**
 * @route   GET /api/storefronts/:handle
 * @desc    Get a storefront by handle (public storefront page)
 * @access  Public
 */
const getStorefrontByHandle = async (req, res, next) => {
  try {
    const { handle } = req.params;

    const storefront = await prisma.storefront.findUnique({
      where: { handle },
      include: {
        category: true,
        owner: { select: { id: true, name: true, verificationTier: true } },
        products: {
          where: { isActive: true },
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            _count: { select: { reviews: true } },
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        },
        posts: {
          where: { isPublished: true },
          orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
          take: 20,
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            coverImage: true,
            mediaUrls: true,
            postType: true,
            isPinned: true,
            publishedAt: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            product: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { followers: true, products: true, reviews: true } },
      },
    });

    if (!storefront) {
      return res.status(404).json({ message: 'Storefront not found', code: 'NOT_FOUND' });
    }
    if (storefront.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'This storefront has been suspended', code: 'SUSPENDED' });
    }

    const avgRating =
      storefront.reviews.length > 0
        ? (storefront.reviews.reduce((s, r) => s + r.rating, 0) / storefront.reviews.length).toFixed(1)
        : null;

    res.json({ ...storefront, avgRating: avgRating ? Number(avgRating) : null });
  } catch (error) {
    logger.error({ err: error }, 'Get storefront error');
    next(error);
  }
};

/**
 * @route   GET /api/storefronts
 * @desc    List all active storefronts (with optional category filter)
 * @access  Public
 */
const listStorefronts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { status: 'ACTIVE' };
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [storefronts, total] = await Promise.all([
      prisma.storefront.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, storefrontLabel: true } },
          owner: { select: { id: true, name: true, verificationTier: true } },
          _count: { select: { followers: true, products: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.storefront.count({ where }),
    ]);

    res.json({
      storefronts,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    logger.error({ err: error }, 'List storefronts error');
    next(error);
  }
};

/**
 * @route   PUT /api/storefronts/me
 * @desc    Update the logged-in vendor's storefront
 * @access  Private (VENDOR)
 */
const updateMyStorefront = async (req, res, next) => {
  try {
    let storefront = req.user.storefront;
    if (!storefront || !storefront.id) {
      storefront = await prisma.storefront.findFirst({ where: { ownerId: req.user.id } });
    }
    if (!storefront) {
      return res.status(404).json({ message: 'You do not have a storefront', code: 'NOT_FOUND' });
    }

    const {
      displayName, tagline, description, aboutContent, teamMembers, categoryId,
      themeColor, accentColor, layoutVariant, socialLinks, operatingHours, vacationMode,
      logoUrl, bannerUrl,
    } = req.body;

    // Build update data (only update provided fields)
    const data = {};
    if (displayName !== undefined) data.displayName = String(displayName).trim();
    if (tagline !== undefined) data.tagline = String(tagline).trim();
    if (description !== undefined) data.description = String(description).trim();
    if (aboutContent !== undefined) data.aboutContent = String(aboutContent).trim();
    if (teamMembers !== undefined) data.teamMembers = teamMembers;
    if (themeColor !== undefined) data.themeColor = themeColor;
    if (accentColor !== undefined) data.accentColor = accentColor;
    if (layoutVariant !== undefined) data.layoutVariant = layoutVariant;
    if (socialLinks !== undefined) data.socialLinks = socialLinks;
    if (operatingHours !== undefined) data.operatingHours = operatingHours;
    if (vacationMode !== undefined) data.vacationMode = Boolean(vacationMode);
    
    // Auto-fix URL formatting if user omitted https://
    if (logoUrl !== undefined) {
      let trimmed = (logoUrl || '').trim();
      if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
        trimmed = `https://${trimmed}`;
      }
      data.logoUrl = trimmed || null;
    }
    if (bannerUrl !== undefined) {
      let trimmed = (bannerUrl || '').trim();
      if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
        trimmed = `https://${trimmed}`;
      }
      data.bannerUrl = trimmed || null;
    }

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || !category.isActive) {
        return res.status(400).json({ message: 'Invalid category', code: 'VALIDATION_ERROR' });
      }
      data.categoryId = categoryId;
    }

    const updated = await prisma.storefront.update({
      where: { id: storefront.id },
      data,
      include: {
        category: true,
        _count: { select: { followers: true, products: true } },
      },
    });

    logger.info({ storefrontId: storefront.id }, 'Storefront updated');
    res.json(updated);
  } catch (error) {
    logger.error({ err: error }, 'Update storefront error');
    next(error);
  }
};

/**
 * @route   POST /api/storefronts/me/upload
 * @desc    Upload storefront banner or logo image directly
 * @access  Private (VENDOR)
 */
const uploadStorefrontAsset = async (req, res, next) => {
  try {
    let sf = req.user.storefront;
    if (!sf || !sf.id) {
      sf = await prisma.storefront.findFirst({ where: { ownerId: req.user.id } });
    }
    if (!sf) {
      return res.status(404).json({ message: 'Storefront not found', code: 'NOT_FOUND' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded', code: 'VALIDATION_ERROR' });
    }

    const { type } = req.body; // 'banner' or 'logo'
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    let imageUrl = dataURI;
    try {
      const { cloudinary } = require('../config/cloudinary');
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'universe-storefronts',
        });
        imageUrl = result.secure_url;
      }
    } catch (cErr) {
      logger.warn({ err: cErr }, 'Cloudinary upload fallback to dataURI');
    }

    const updateData = type === 'banner' ? { bannerUrl: imageUrl } : { logoUrl: imageUrl };
    const updated = await prisma.storefront.update({
      where: { id: sf.id },
      data: updateData,
      include: {
        category: true,
      },
    });

    res.json({ url: imageUrl, storefront: updated });
  } catch (error) {
    logger.error({ err: error }, 'Upload storefront asset error');
    next(error);
  }
};

module.exports = { createStorefront, getStorefrontByHandle, listStorefronts, updateMyStorefront, uploadStorefrontAsset };
