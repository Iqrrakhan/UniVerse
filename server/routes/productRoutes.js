const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProduct, updateProduct } = require('../controllers/productController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { createProductSchema } = require('../lib/schemas');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected vendor routes
router.post(
  '/',
  protect,
  requireRole('VENDOR', 'ADMIN'),
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ message: 'Upload failed', error: err.message });
      next();
    });
  },
  createProduct
);

router.patch('/:id', protect, requireRole('VENDOR', 'ADMIN'), updateProduct);

module.exports = router;