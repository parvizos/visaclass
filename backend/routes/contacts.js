import express from 'express';
import { collections } from '../config/storage.js';
import { emailService } from '../services/emailService.js';
import { validateContact } from '../middleware/validation.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/contacts - Submit contact form
router.post('/', validateContact, async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      contactId: `CON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };

    // Save to Firebase
    const docRef = await collections.contacts.add(contactData);

    // Prepare data for emails
    const emailData = {
      ...contactData,
      id: docRef.id,
    };

    // Send notification email to admin
    try {
      await emailService.sendContactNotification(emailData);
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // Don't fail the contact submission if email fails
    }

    // Send auto-reply to sender
    try {
      await emailService.sendContactAutoReply(emailData);
    } catch (emailError) {
      console.error('Failed to send auto-reply email:', emailError);
      // Don't fail the contact submission if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        contactId: contactData.contactId,
        id: docRef.id,
        status: contactData.status,
        submittedAt: contactData.submittedAt,
      },
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/contacts - Get all contact submissions (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    let query = collections.contacts.orderBy('submittedAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    let contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.subject.toLowerCase().includes(searchLower) ||
        contact.contactId.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedContacts = contacts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedContacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(contacts.length / limit),
        totalContacts: contacts.length,
        hasNext: endIndex < contacts.length,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/contacts/:id - Get specific contact submission
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await collections.contacts.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// PUT /api/contacts/:id/status - Update contact status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const contactRef = collections.contacts.doc(id);
    const contactDoc = await contactRef.get();

    if (!contactDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    // Update contact status
    const updateData = {
      status,
      adminNotes,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: 'admin', // In real app, this would be the admin user ID
    };

    await contactRef.update(updateData);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: {
        id,
        status,
        statusUpdatedAt: updateData.statusUpdatedAt,
      },
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// POST /api/contacts/:id/reply - Reply to contact submission
router.post('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, subject } = req.body;

    if (!message || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Message and subject are required',
      });
    }

    const contactDoc = await collections.contacts.doc(id).get();
    
    if (!contactDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    const contactData = contactDoc.data();

    // Send reply email
    try {
      const replyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">VISACLASS</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">University Application System</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
            
            <p style="color: #666; line-height: 1.6;">Dear ${contactData.name},</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">Best regards,<br>The VISACLASS Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              © 2024 VISACLASS. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await emailService.sendEmail(contactData.email, subject, replyHtml);

      // Update contact status to resolved
      await collections.contacts.doc(id).update({
        status: 'resolved',
        adminNotes: `Replied: ${subject}`,
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: 'admin',
      });

      res.json({
        success: true,
        message: 'Reply sent successfully',
        data: {
          id,
          status: 'resolved',
          repliedAt: new Date().toISOString(),
        },
      });

    } catch (emailError) {
      console.error('Failed to send reply email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send reply email',
        error: process.env.NODE_ENV === 'development' ? emailError.message : 'Internal server error',
      });
    }

  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reply to contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// DELETE /api/contacts/:id - Delete contact submission (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await collections.contacts.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    await collections.contacts.doc(id).delete();

    res.json({
      success: true,
      message: 'Contact submission deleted successfully',
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/contacts/stats - Get contact statistics
router.get('/stats', async (req, res) => {
  try {
    const snapshot = await collections.contacts.get();
    const contacts = snapshot.docs.map(doc => doc.data());

    const stats = {
      total: contacts.length,
      pending: contacts.filter(contact => contact.status === 'pending').length,
      inProgress: contacts.filter(contact => contact.status === 'in_progress').length,
      resolved: contacts.filter(contact => contact.status === 'resolved').length,
      closed: contacts.filter(contact => contact.status === 'closed').length,
    };

    // Calculate monthly submissions
    const monthlySubmissions = {};
    contacts.forEach(contact => {
      const month = new Date(contact.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlySubmissions[month] = (monthlySubmissions[month] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        ...stats,
        monthlySubmissions,
        lastUpdated: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

export default router;
