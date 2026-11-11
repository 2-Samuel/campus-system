import express from 'express';
import { db } from '../services/dbService.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.profileId;
    const allNotifs = await db.find('notifications', {});
    const userNotifs = allNotifs.filter(n => n.userId === userId || n.userId === req.user.email);
    userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = userNotifs.filter(n => !n.read).length;

    res.json({
      success: true,
      unreadCount,
      notifications: userNotifs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Mark single notification as read
router.put('/:id/read', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.findByIdAndUpdate('notifications', id, { read: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/mark-all-read', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.profileId;
    await db.update('notifications', { userId }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

export default router;
