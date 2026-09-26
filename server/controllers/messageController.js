const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get full message thread between current user and another user
 * @access  Private
 */
const getConversation = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    // Mark messages from the other user as read
    await prisma.message.updateMany({
      where: { senderId: userId, receiverId: myId, read: false },
      data: { read: true },
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
        order: { select: { id: true, orderNumber: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    logger.error({ err: error }, 'Get conversation error');
    next(error);
  }
};

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversation threads for the current user (last message per thread)
 * @access  Private
 */
const getMyConversations = async (req, res, next) => {
  try {
    const myId = req.user.id;

    // Get all messages involving this user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: myId }, { receiverId: myId }],
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true, storefront: { select: { handle: true, displayName: true } } },
        },
        receiver: {
          select: { id: true, name: true, avatarUrl: true, storefront: { select: { handle: true, displayName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Deduplicate: one entry per unique conversation partner
    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        const otherUser = msg.senderId === myId ? msg.receiver : msg.sender;
        conversations.push({
          lastMessage: msg,
          otherUser,
          unreadCount: 0, // Will be populated below
        });
      }
    }

    // Get unread counts for each conversation
    const unreadCounts = await prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: myId, read: false },
      _count: { id: true },
    });
    const unreadMap = Object.fromEntries(unreadCounts.map((r) => [r.senderId, r._count.id]));
    conversations.forEach((conv) => {
      conv.unreadCount = unreadMap[conv.otherUser.id] || 0;
    });

    res.json(conversations);
  } catch (error) {
    logger.error({ err: error }, 'Get conversations error');
    next(error);
  }
};

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get total unread message count for the current user
 * @access  Private
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.message.count({
      where: { receiverId: req.user.id, read: false },
    });
    res.json({ unreadCount: count });
  } catch (error) {
    logger.error({ err: error }, 'Get unread count error');
    next(error);
  }
};

/**
 * @route   GET /api/messages/user/:userId
 * @desc    Get public chat profile of a user (with storefront info if vendor)
 * @access  Private
 */
const getUserChatProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        verificationTier: true,
        storefront: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(target);
  } catch (error) {
    logger.error({ err: error }, 'Get user chat profile error');
    next(error);
  }
};

module.exports = { getConversation, getMyConversations, getUnreadCount, getUserChatProfile };