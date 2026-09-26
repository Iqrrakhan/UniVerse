const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

/**
 * @route   GET /api/posts/storefront/:handle
 * @desc    Get all published posts for a storefront (public)
 * @access  Public
 */
const getStorefrontPosts = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const storefront = await prisma.storefront.findUnique({ where: { handle }, select: { id: true } });
    if (!storefront) {
      return res.status(404).json({ message: 'Storefront not found', code: 'NOT_FOUND' });
    }

    const where = { storefrontId: storefront.id, isPublished: true };
    if (type) where.postType = type;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: Number(limit),
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          coverImage: true,
          mediaUrls: true,
          postType: true,
          publishedAt: true,
          isPinned: true,
          createdAt: true,
          storefront: {
            select: {
              displayName: true,
              handle: true,
              logoUrl: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({ posts, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    logger.error({ err: error }, 'Get storefront posts error');
    next(error);
  }
};

/**
 * @route   GET /api/posts/my
 * @desc    Get all posts for the logged-in vendor (including drafts)
 * @access  Private (VENDOR)
 */
const getMyPosts = async (req, res, next) => {
  try {
    let sf = req.user.storefront;
    if (!sf) sf = await prisma.storefront.findFirst({ where: { ownerId: req.user.id }, select: { id: true } });
    if (!sf) return res.status(404).json({ message: 'No storefront found', code: 'NOT_FOUND' });

    const posts = await prisma.post.findMany({
      where: { storefrontId: sf.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        coverImage: true,
        mediaUrls: true,
        postType: true,
        isPublished: true,
        isPinned: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(posts);
  } catch (error) {
    logger.error({ err: error }, 'Get my posts error');
    next(error);
  }
};

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private (VENDOR)
 */
const createPost = async (req, res, next) => {
  try {
    let sf = req.user.storefront;
    if (!sf) sf = await prisma.storefront.findFirst({ where: { ownerId: req.user.id }, select: { id: true } });
    if (!sf) return res.status(404).json({ message: 'No storefront found', code: 'NOT_FOUND' });

    const { title, content, coverImage, mediaUrls, postType, isPublished, isPinned } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Title and content are required', code: 'VALIDATION_ERROR' });
    }

    // Generate slug from title
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;

    const post = await prisma.post.create({
      data: {
        storefrontId: sf.id,
        title: title.trim(),
        slug,
        content: content.trim(),
        coverImage: coverImage || null,
        mediaUrls: mediaUrls || [],
        postType: postType || 'UPDATE',
        isPublished: Boolean(isPublished),
        isPinned: Boolean(isPinned),
        publishedAt: isPublished ? new Date() : null,
      },
    });

    logger.info({ postId: post.id, storefrontId: sf.id }, 'Post created');
    res.status(201).json(post);
  } catch (error) {
    logger.error({ err: error }, 'Create post error');
    next(error);
  }
};

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private (VENDOR)
 */
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sf = req.user.storefront;
    if (!sf) sf = await prisma.storefront.findFirst({ where: { ownerId: req.user.id }, select: { id: true } });
    if (!sf) return res.status(404).json({ message: 'No storefront found', code: 'NOT_FOUND' });

    const existing = await prisma.post.findFirst({ where: { id, storefrontId: sf.id } });
    if (!existing) return res.status(404).json({ message: 'Post not found', code: 'NOT_FOUND' });

    const { title, content, coverImage, mediaUrls, postType, isPublished, isPinned } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (content !== undefined) data.content = content.trim();
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (mediaUrls !== undefined) data.mediaUrls = mediaUrls;
    if (postType !== undefined) data.postType = postType;
    if (isPinned !== undefined) data.isPinned = Boolean(isPinned);
    if (isPublished !== undefined) {
      data.isPublished = Boolean(isPublished);
      if (isPublished && !existing.publishedAt) data.publishedAt = new Date();
    }

    const updated = await prisma.post.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    logger.error({ err: error }, 'Update post error');
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private (VENDOR)
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sf = req.user.storefront;
    if (!sf) sf = await prisma.storefront.findFirst({ where: { ownerId: req.user.id }, select: { id: true } });
    if (!sf) return res.status(404).json({ message: 'No storefront found', code: 'NOT_FOUND' });

    const existing = await prisma.post.findFirst({ where: { id, storefrontId: sf.id } });
    if (!existing) return res.status(404).json({ message: 'Post not found', code: 'NOT_FOUND' });

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete post error');
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/upload
 * @desc    Upload a cover image or media for a post
 * @access  Private (VENDOR)
 */
const uploadPostMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded', code: 'VALIDATION_ERROR' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    let imageUrl = dataURI;
    try {
      const { cloudinary } = require('../config/cloudinary');
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const result = await cloudinary.uploader.upload(dataURI, { folder: 'universe-posts' });
        imageUrl = result.secure_url;
      }
    } catch (cErr) {
      logger.warn({ err: cErr }, 'Cloudinary upload fallback to dataURI');
    }

    res.json({ url: imageUrl });
  } catch (error) {
    logger.error({ err: error }, 'Upload post media error');
    next(error);
  }
};

module.exports = { getStorefrontPosts, getMyPosts, createPost, updatePost, deletePost, uploadPostMedia };
