const express = require('express');
const router = express.Router();
const {
  createStorefront,
  getStorefrontByHandle,
  listStorefronts,
  updateMyStorefront,
  uploadStorefrontAsset,
} = require('../controllers/storefrontController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', listStorefronts);
router.post('/', protect, requireRole('VENDOR', 'ADMIN'), createStorefront);
router.put('/me', protect, requireRole('VENDOR', 'ADMIN'), updateMyStorefront);
router.post(
  '/me/upload',
  protect,
  requireRole('VENDOR', 'ADMIN'),
  upload.single('file'),
  uploadStorefrontAsset
);
router.get('/:handle', getStorefrontByHandle);

module.exports = router;
