import express from 'express';
import { collections } from '../config/storage.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// GET /api/messages/:contactId - Get conversation thread for a contact
router.get('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // Get all messages for this contact, ordered by date
    const messages = await collections.messages.where('contactId', contactId).get();
    const sortedMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    res.json({
      success: true,
      data: sortedMessages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
    });
  }
});

// POST /api/messages/:contactId - Send a message in the conversation
router.post('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { content, sender, senderType, senderName } = req.body;

    if (!content || !sender || !senderType) {
      return res.status(400).json({
        success: false,
        message: 'Content, sender, and senderType are required',
      });
    }

    // Get the contact to get student email
    const contacts = await collections.contacts.where('contactId', contactId).get();
    const contact = contacts[0];
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Create the message
    const messageData = {
      contactId,
      content,
      sender,
      senderType, // 'student' or 'admin'
      senderName,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const messageRef = await collections.messages.add(messageData);

    // Update contact status based on who sent the message
    if (senderType === 'admin') {
      await collections.contacts.doc(contact.id).update({
        status: 'in_progress',
        lastReplyAt: new Date().toISOString(),
        lastReplyBy: 'admin',
      });
      
      // Send email notification to student
      try {
        await emailService.sendEmail(
          contact.email,
          'New Reply from VISACLASS Support',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">VISACLASS</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">New Message</p>
              </div>
              <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="color: #666; line-height: 1.6;">Dear ${contact.name},</p>
                <p style="color: #666; line-height: 1.6;">You have received a new reply from our support team regarding: <strong>${contact.subject}</strong></p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #333; line-height: 1.6;">${content}</p>
                </div>
                <p style="color: #666; line-height: 1.6;">You can reply to this message by visiting our contact page.</p>
              </div>
            </div>
          `
        );
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    } else {
      await collections.contacts.doc(contact.id).update({
        status: 'pending',
        lastMessageAt: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: messageRef.id,
        ...messageData,
      },
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
});

// PUT /api/messages/:messageId/read - Mark message as read
router.put('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    await collections.messages.doc(messageId).update({
      read: true,
      readAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
    });
  }
});

// GET /api/messages/unread/:contactId - Get unread message count for contact
router.get('/unread/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { senderType } = req.query; // 'student' or 'admin' - get unread messages from opposite
    
    const messages = await collections.messages.where('contactId', contactId).get();
    const unreadCount = messages.filter(
      msg => !msg.read && msg.senderType !== senderType
    ).length;

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
    });
  }
});

export default router;
