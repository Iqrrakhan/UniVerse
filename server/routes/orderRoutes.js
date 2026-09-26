const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getStorefrontOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/storefront', protect, requireRole('VENDOR', 'ADMIN'), getStorefrontOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;