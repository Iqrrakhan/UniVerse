const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../lib/logger');
const { ConflictError, UnauthorizedError, ValidationError } = require('../lib/errors');

// ─── Token helpers ──────────────────────────────────────────

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });

const generateRefreshToken = (id) =>
  jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

/**
 * Sanitized user object for API responses (no password, no refresh token).
 */
const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || null,
  avatarUrl: user.avatarUrl || null,
  role: user.role,
  emailVerified: user.emailVerified,
  verificationTier: user.verificationTier,
  createdAt: user.createdAt,
  storefront: user.storefront || null,
});

// ─── Controllers ────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Buyer or Vendor)
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.validated;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists', code: 'CONFLICT' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'BUYER',
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    logger.info({ userId: user.id, email: user.email }, 'User registered');

    res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      message: 'Account created successfully!',
    });
  } catch (error) {
    logger.error({ err: error }, 'Registration error');
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.validated;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        storefront: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            tagline: true,
            description: true,
            status: true,
            categoryId: true,
            themeColor: true,
            accentColor: true,
            logoUrl: true,
            bannerUrl: true,
            socialLinks: true,
            vacationMode: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password', code: 'UNAUTHORIZED' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password', code: 'UNAUTHORIZED' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    logger.info({ userId: user.id }, 'User logged in');

    res.status(200).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using a valid refresh token
 * @access  Public (requires valid refresh token)
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required', code: 'VALIDATION_ERROR' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token', code: 'UNAUTHORIZED' });
    }

    // Check if refresh token matches the one stored for this user
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token', code: 'UNAUTHORIZED' });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error({ err: error }, 'Token refresh error');
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private (requires auth)
 */
const logoutUser = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });

    logger.info({ userId: req.user.id }, 'User logged out');

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Logout error');
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        storefront: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            tagline: true,
            description: true,
            status: true,
            categoryId: true,
            themeColor: true,
            accentColor: true,
            logoUrl: true,
            bannerUrl: true,
            socialLinks: true,
            vacationMode: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' });
    }

    res.status(200).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    logger.error({ err: error }, 'GetMe error');
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email (Tier 1 verification)
 * @access  Private
 */
const verifyEmail = async (req, res, next) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        emailVerified: true,
        verificationTier: req.user.verificationTier === 'EMAIL_PENDING' ? 'EMAIL_VERIFIED' : req.user.verificationTier,
      },
      include: {
        storefront: true,
      },
    });

    logger.info({ userId: req.user.id }, 'Email verified');
    res.json({
      message: 'Email successfully verified!',
      user: sanitizeUser(updated),
    });
  } catch (error) {
    logger.error({ err: error }, 'Verify email error');
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-business
 * @desc    Submit business verification details (Tier 3 verification badge)
 * @access  Private (VENDOR)
 */
const verifyBusiness = async (req, res, next) => {
  try {
    const { businessName, registrationNumber, documentUrl, notes } = req.body;

    // Create verification document record
    await prisma.verificationDocument.create({
      data: {
        userId: req.user.id,
        documentType: 'BUSINESS_REGISTRATION',
        fileUrl: documentUrl || registrationNumber || 'ONLINE_VERIFICATION',
        status: 'APPROVED',
      },
    });

    // Update user tier
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        verificationTier: 'BUSINESS_VERIFIED',
      },
      include: {
        storefront: true,
      },
    });

    logger.info({ userId: req.user.id, businessName }, 'Business verification approved');
    res.json({
      message: 'Brand verification approved! Your Verified Brand badge is now active.',
      user: sanitizeUser(updated),
    });
  } catch (error) {
    logger.error({ err: error }, 'Verify business error');
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
  verifyEmail,
  verifyBusiness,
};