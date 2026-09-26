const express = require('express');
const router = express.Router();
const {
  getStorefrontPosts,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  uploadPostMedia,
} = require('../controllers/postController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/storefront/:handle', getStorefrontPosts);

// Private vendor routes
router.get('/my', protect, requireRole('VENDOR', 'ADMIN'), getMyPosts);
router.get('/mine', protect, requireRole('VENDOR', 'ADMIN'), getMyPosts);
router.post('/', protect, requireRole('VENDOR', 'ADMIN'), createPost);
router.put('/:id', protect, requireRole('VENDOR', 'ADMIN'), updatePost);
router.delete('/:id', protect, requireRole('VENDOR', 'ADMIN'), deletePost);
router.post(
  '/:id/upload',
  protect,
  requireRole('VENDOR', 'ADMIN'),
  upload.single('file'),
  uploadPostMedia
);

module.exports = router;
