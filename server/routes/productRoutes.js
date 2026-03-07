const express = require('express');
const router = express.Router();
const { createProduct, getProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getProducts)
  .post(protect, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.log('MULTER ERROR:', err);
        return res.status(400).json({ message: 'Upload failed', error: err.message });
      }
      next();
    });
  }, createProduct);

module.exports = router;