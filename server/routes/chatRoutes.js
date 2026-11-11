import express from 'express';
import { db } from '../services/dbService.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Get conversation between logged-in user and another user
router.get('/conversation/:otherId', verifyAuth, async (req, res) => {
  try {
    const myId = req.user.profileId;
    const { otherId } = req.params;

    const allMessages = await db.find('messages', {});
    const thread = allMessages.filter(
      m => (m.senderId === myId && m.receiverId === otherId) ||
           (m.senderId === otherId && m.receiverId === myId)
    );

    // Mark messages sent to me as read
    await db.update('messages', { receiverId: myId, senderId: otherId }, { read: true });

    res.json({ success: true, count: thread.length, messages: thread });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
});

// Send a message
router.post('/send', verifyAuth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    const newMessage = await db.insert('messages', {
      senderId: req.user.profileId,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiverId,
      content: content.trim(),
      read: false
    });

    // Also trigger in-app notification
    await db.insert('notifications', {
      userId: receiverId,
      role: req.user.role === 'student' ? 'lecturer' : 'student',
      title: 'New Consultation Message',
      message: `${req.user.name} sent you a message: "${content.slice(0, 60)}..."`,
      type: 'new_message',
      read: false
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

export default router;
