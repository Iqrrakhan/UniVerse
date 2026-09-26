const { z } = require('zod');

// ─── Auth Schemas ───────────────────────────────────────────

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .max(255)
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  role: z
    .enum(['BUYER', 'VENDOR'], { message: 'Role must be BUYER or VENDOR' })
    .optional()
    .default('BUYER'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// ─── Storefront Schemas ─────────────────────────────────────

const createStorefrontSchema = z.object({
  handle: z
    .string({ required_error: 'Handle is required' })
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle must be at most 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Handle can only contain lowercase letters, numbers, hyphens, and underscores')
    .trim(),
  displayName: z
    .string({ required_error: 'Display name is required' })
    .min(2, 'Display name must be at least 2 characters')
    .max(100)
    .trim(),
  tagline: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  categoryId: z.string({ required_error: 'Category is required' }).cuid(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
});

const updateStorefrontSchema = createStorefrontSchema.partial().omit({ handle: true }).extend({
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
  bannerUrl: z.string().url().optional().nullable().or(z.literal('')),
  socialLinks: z.record(z.string()).optional().nullable(),
  vacationMode: z.boolean().optional(),
});

// ─── Product Schemas ────────────────────────────────────────

const createProductSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(200)
    .trim(),
  description: z
    .string({ required_error: 'Description is required' })
    .min(20, 'Description must be at least 20 characters for better visibility')
    .max(5000)
    .trim(),
  basePrice: z
    .number({ required_error: 'Price is required' })
    .positive('Price must be greater than 0')
    .max(10000000, 'Price exceeds maximum'),
  itemType: z.enum(['PHYSICAL', 'SERVICE', 'DIGITAL'], {
    message: 'Item type must be PHYSICAL, SERVICE, or DIGITAL',
  }),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  stockCount: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateProductSchema = createProductSchema.partial();

// ─── Order Schemas ──────────────────────────────────────────

const createOrderSchema = z.object({
  storefrontId: z.string({ required_error: 'Storefront ID is required' }).cuid(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        variantId: z.string().cuid().optional(),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['COD', 'DIGITAL', 'BANK_TRANSFER']),
  deliveryMethod: z.enum(['DELIVERY', 'PICKUP', 'DIGITAL_DELIVERY']),
  deliveryAddress: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      phone: z.string().min(1),
    })
    .optional(),
  buyerNote: z.string().max(500).optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ]),
  sellerNote: z.string().max(500).optional(),
});

// ─── Review Schemas ─────────────────────────────────────────

const createReviewSchema = z.object({
  storefrontId: z.string().cuid(),
  productId: z.string().cuid(),
  orderId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string({ required_error: 'Review comment is required' })
    .min(10, 'Review must be at least 10 characters')
    .max(2000),
});

// ─── Blog Post Schemas ──────────────────────────────────────

const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(200)
    .trim(),
  content: z
    .string({ required_error: 'Content is required' })
    .min(50, 'Content must be at least 50 characters')
    .max(50000),
  coverImage: z.string().url().optional(),
  postType: z
    .enum(['FOUNDING_STORY', 'UPDATE', 'MILESTONE', 'BEHIND_THE_SCENES', 'ANNOUNCEMENT'])
    .optional()
    .default('UPDATE'),
  isPublished: z.boolean().optional().default(false),
});

const updatePostSchema = createPostSchema.partial();

// ─── Report Schema ──────────────────────────────────────────

const createReportSchema = z.object({
  targetType: z.enum(['LISTING', 'ACCOUNT', 'MESSAGE', 'REVIEW', 'POST']),
  targetId: z.string().cuid(),
  reason: z.enum(['SCAM', 'MISLEADING', 'OFFENSIVE', 'IP_VIOLATION', 'SPAM', 'OTHER']),
  details: z.string().max(1000).optional(),
});

// ─── Common Param Schemas ───────────────────────────────────

const idParamSchema = z.object({
  id: z.string().cuid(),
});

const handleParamSchema = z.object({
  handle: z.string().min(3).max(30),
});

module.exports = {
  registerSchema,
  loginSchema,
  createStorefrontSchema,
  updateStorefrontSchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createReviewSchema,
  createPostSchema,
  updatePostSchema,
  createReportSchema,
  idParamSchema,
  handleParamSchema,
};
