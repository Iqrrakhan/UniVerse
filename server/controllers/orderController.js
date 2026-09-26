const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

// ─── Helpers ────────────────────────────────────────────────

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `UV-${date}-${rand}`;
};

// ─── Controllers ────────────────────────────────────────────

/**
 * @route   POST /api/orders
 * @desc    Create a new order (buyer places order with a storefront)
 * @access  Private (BUYER)
 */
const createOrder = async (req, res, next) => {
  try {
    const { storefrontId, items, paymentMethod, deliveryMethod, deliveryAddress, buyerNote } = req.body;
    const buyerId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item', code: 'VALIDATION_ERROR' });
    }

    // Verify storefront exists and is active
    const storefront = await prisma.storefront.findUnique({
      where: { id: storefrontId },
    });
    if (!storefront || storefront.status !== 'ACTIVE') {
      return res.status(404).json({ message: 'Storefront not found or inactive', code: 'NOT_FOUND' });
    }

    // Prevent ordering from own storefront
    if (storefront.ownerId === buyerId) {
      return res.status(400).json({ message: 'You cannot place an order at your own storefront', code: 'VALIDATION_ERROR' });
    }

    // Fetch all products and validate
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storefrontId, isActive: true },
    });

    if (products.length !== items.length) {
      return res.status(400).json({ message: 'One or more products are unavailable', code: 'VALIDATION_ERROR' });
    }

    // Build order items and calculate totals
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap[item.productId];
      const unitPrice = Number(product.basePrice);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        variantId: item.variantId || null,
        title: product.title,
        quantity: item.quantity,
        unitPrice,
        total: itemTotal,
      };
    });

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId,
          storefrontId,
          subtotal,
          commission: 0, // Phase 7: calculate commission here
          total: subtotal,
          paymentMethod: paymentMethod || 'COD',
          deliveryMethod: deliveryMethod || 'DELIVERY',
          deliveryAddress: deliveryAddress || null,
          buyerNote: buyerNote || null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, title: true, images: { take: 1 } } },
            },
          },
          storefront: { select: { id: true, handle: true, displayName: true } },
          buyer: { select: { id: true, name: true, email: true } },
        },
      });
      return newOrder;
    });

    logger.info({ orderId: order.id, buyerId, storefrontId }, 'Order created');
    res.status(201).json(order);
  } catch (error) {
    logger.error({ err: error }, 'Create order error');
    next(error);
  }
};

/**
 * @route   GET /api/orders/my
 * @desc    Get all orders placed by the logged-in buyer
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
          },
        },
        storefront: { select: { id: true, handle: true, displayName: true, logoUrl: true, ownerId: true } },
        payment: { select: { status: true, method: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const orderIds = orders.map((o) => o.id);
    const reviews = await prisma.review.findMany({
      where: { orderId: { in: orderIds }, authorId: req.user.id },
      select: { id: true, orderId: true, productId: true, rating: true, comment: true, sellerReply: true, createdAt: true },
    });
    const reviewMap = Object.fromEntries(reviews.map((r) => [r.orderId, r]));

    const ordersWithReview = orders.map((order) => ({
      ...order,
      review: reviewMap[order.id] || null,
    }));

    res.json(ordersWithReview);
  } catch (error) {
    logger.error({ err: error }, 'Get my orders error');
    next(error);
  }
};

/**
 * @route   GET /api/orders/storefront
 * @desc    Get all orders received by the logged-in vendor's storefront
 * @access  Private (VENDOR)
 */
const getStorefrontOrders = async (req, res, next) => {
  try {
    const { storefront } = req.user;
    if (!storefront) {
      return res.status(400).json({ message: 'You do not have a storefront', code: 'NO_STOREFRONT' });
    }

    const orders = await prisma.order.findMany({
      where: { storefrontId: storefront.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true } },
          },
        },
        buyer: { select: { id: true, name: true, email: true } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    logger.error({ err: error }, 'Get storefront orders error');
    next(error);
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID (buyer or seller only)
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
          },
        },
        storefront: { select: { id: true, handle: true, displayName: true, ownerId: true } },
        buyer: { select: { id: true, name: true, email: true } },
        payment: true,
        dispute: true,
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found', code: 'NOT_FOUND' });
    }

    // Only buyer or storefront owner can view
    const isOwner = order.storefront.ownerId === req.user.id;
    const isBuyer = order.buyerId === req.user.id;
    if (!isOwner && !isBuyer && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
    }

    res.json(order);
  } catch (error) {
    logger.error({ err: error }, 'Get order by id error');
    next(error);
  }
};

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (vendor only; buyer can only mark COMPLETED)
 * @access  Private
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, sellerNote } = req.body;
    const { storefront } = req.user;

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found', code: 'NOT_FOUND' });
    }

    const isBuyer = order.buyerId === req.user.id;
    const isSeller = storefront && order.storefrontId === storefront.id;

    // Buyer can only mark COMPLETED (confirm receipt)
    if (isBuyer && status !== 'COMPLETED') {
      return res.status(403).json({ message: 'Buyers can only confirm receipt (mark as completed)', code: 'FORBIDDEN' });
    }
    // Seller can confirm, process, ship, cancel
    if (!isBuyer && !isSeller && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this order', code: 'FORBIDDEN' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(sellerNote && { sellerNote }),
      },
    });

    logger.info({ orderId: order.id, newStatus: status, updatedBy: req.user.id }, 'Order status updated');
    res.json(updatedOrder);
  } catch (error) {
    logger.error({ err: error }, 'Update order status error');
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getStorefrontOrders, getOrderById, updateOrderStatus };
