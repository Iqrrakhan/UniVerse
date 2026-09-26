const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const { UnauthorizedError, ForbiddenError } = require('../lib/errors');

/**
 * Extracts and verifies JWT from the Authorization header.
 * Attaches the full user record (minus password) to req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Not authorized, no token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        verificationTier: true,
        createdAt: true,
        updatedAt: true,
        storefront: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            tagline: true,
            description: true,
            categoryId: true,
            logoUrl: true,
            bannerUrl: true,
            themeColor: true,
            accentColor: true,
            status: true,
            socialLinks: true,
            vacationMode: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Not authorized, user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({ message: error.message, code: error.code });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired', code: 'UNAUTHORIZED' });
    }
    logger.error({ err: error }, 'Auth middleware error');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware factory: restricts access to specified roles.
 * Must be used after protect().
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized', code: 'UNAUTHORIZED' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient role', code: 'FORBIDDEN' });
  }
  next();
};

/**
 * Middleware: requires the user to have email verified.
 * Must be used after protect().
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized', code: 'UNAUTHORIZED' });
  }
  if (!req.user.emailVerified) {
    return res.status(403).json({ message: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' });
  }
  next();
};

module.exports = { protect, requireRole, requireVerifiedEmail };