import express from 'express';
import { collections } from '../config/storage.js';
import { validateApplicationStatus } from '../middleware/validation.js';

const router = express.Router();

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get applications stats
    const applications = await collections.applications.get();
    const contacts = await collections.contacts.get();

    // Calculate statistics
    const totalApplications = applications.length;
    const totalContacts = contacts.length;

    const applicationStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      underReview: applications.filter(app => app.status === 'under_review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      waitlisted: applications.filter(app => app.status === 'waitlisted').length,
    };

    const contactStats = {
      total: contacts.length,
      pending: contacts.filter(contact => contact.status === 'pending').length,
      inProgress: contacts.filter(contact => contact.status === 'in_progress').length,
      resolved: contacts.filter(contact => contact.status === 'resolved').length,
      closed: contacts.filter(contact => contact.status === 'closed').length,
    };

    // Get recent applications (last 5)
    const recentApplications = applications
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5)
      .map(app => ({
        id: applicationsSnapshot.docs.find(doc => doc.data().applicationId === app.applicationId)?.id,
        applicationId: app.applicationId,
        name: `${app.personalInfo.firstName} ${app.personalInfo.lastName}`,
        email: app.personalInfo.email,
        university: app.programSelection.universityName || 'Unknown',
        program: app.programSelection.program,
        status: app.status,
        submittedAt: app.submittedAt,
      }));

    // Get recent contacts (last 5)
    const recentContacts = contacts
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5)
      .map(contact => ({
        id: contactsSnapshot.docs.find(doc => doc.data().contactId === contact.contactId)?.id,
        contactId: contact.contactId,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        status: contact.status,
        submittedAt: contact.submittedAt,
      }));

    // Calculate monthly trends
    const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

    const currentMonthApplications = applications.filter(app => {
      const appMonth = new Date(app.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      return appMonth === currentMonth;
    }).length;

    const lastMonthApplications = applications.filter(app => {
      const appMonth = new Date(app.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      return appMonth === lastMonth;
    }).length;

    const applicationTrend = {
      current: currentMonthApplications,
      previous: lastMonthApplications,
      percentageChange: lastMonthApplications > 0 
        ? ((currentMonthApplications - lastMonthApplications) / lastMonthApplications * 100).toFixed(1)
        : 0,
    };

    res.json({
      success: true,
      data: {
        applicationStats,
        contactStats,
        recentApplications,
        recentContacts,
        applicationTrend,
        lastUpdated: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/admin/applications - Get applications with advanced filtering
router.get('/applications', async (req, res) => {
  try {
    const { 
      status, 
      university, 
      degreeType, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = collections.applications;
    
    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (university) {
      query = query.where('programSelection.university', '==', university);
    }
    
    if (degreeType) {
      query = query.where('programSelection.degreeType', '==', degreeType);
    }

    const snapshot = await query.get();
    let applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Date range filtering
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      applications = applications.filter(app => new Date(app.submittedAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      applications = applications.filter(app => new Date(app.submittedAt) <= toDate);
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      applications = applications.filter(app => 
        app.personalInfo.firstName.toLowerCase().includes(searchLower) ||
        app.personalInfo.lastName.toLowerCase().includes(searchLower) ||
        app.personalInfo.email.toLowerCase().includes(searchLower) ||
        app.applicationId.toLowerCase().includes(searchLower) ||
        (app.programSelection.universityName && app.programSelection.universityName.toLowerCase().includes(searchLower))
      );
    }

    // Sorting
    applications.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'personalInfo.firstName') {
        aValue = `${a.personalInfo.firstName} ${a.personalInfo.lastName}`;
        bValue = `${b.personalInfo.firstName} ${b.personalInfo.lastName}`;
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedApplications = applications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedApplications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(applications.length / limit),
        totalApplications: applications.length,
        hasNext: endIndex < applications.length,
        hasPrev: page > 1,
      },
      filters: {
        status,
        university,
        degreeType,
        dateFrom,
        dateTo,
        search,
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error('Get admin applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/admin/contacts - Get contacts with advanced filtering
router.get('/contacts', async (req, res) => {
  try {
    const { 
      status, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = collections.contacts;
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    let contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Date range filtering
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      contacts = contacts.filter(contact => new Date(contact.submittedAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      contacts = contacts.filter(contact => new Date(contact.submittedAt) <= toDate);
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.subject.toLowerCase().includes(searchLower) ||
        contact.message.toLowerCase().includes(searchLower) ||
        contact.contactId.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    contacts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

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
      filters: {
        status,
        dateFrom,
        dateTo,
        search,
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error('Get admin contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// PUT /api/admin/applications/:id - Update application (admin only)
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.submittedAt;
    delete updateData.applicationId;

    const applicationRef = collections.applications.doc(id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Add admin update metadata
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = 'admin';

    await applicationRef.update(updateData);

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: {
        id,
        updatedAt: updateData.updatedAt,
      },
    });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// PUT /api/admin/applications/:id/status - Update application status with validation
router.put('/applications/:id/status', validateApplicationStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason } = req.body;

    const applicationRef = collections.applications.doc(id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const applicationData = applicationDoc.data();
    
    // Update application status
    const updateData = {
      status,
      adminNotes,
      rejectionReason,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: 'admin',
    };

    await applicationRef.update(updateData);

    // Send status update email to applicant
    try {
      const { emailService } = await import('../services/emailService.js');
      const emailData = {
        ...applicationData,
        id,
        status,
        adminNotes,
        rejectionReason,
      };
      await emailService.sendApplicationStatusUpdate(emailData);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the update if email fails
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        id,
        status,
        statusUpdatedAt: updateData.statusUpdatedAt,
      },
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/admin/export/applications - Export applications data
router.get('/export/applications', async (req, res) => {
  try {
    const { status, dateFrom, dateTo, format = 'json' } = req.query;
    
    let query = collections.applications;
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    let applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Date range filtering
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      applications = applications.filter(app => new Date(app.submittedAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      applications = applications.filter(app => new Date(app.submittedAt) <= toDate);
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvHeader = 'Application ID,Name,Email,University,Program,Degree Type,Status,Submitted At\n';
      const csvData = applications.map(app => 
        `"${app.applicationId}","${app.personalInfo.firstName} ${app.personalInfo.lastName}","${app.personalInfo.email}","${app.programSelection.universityName || ''}","${app.programSelection.program}","${app.programSelection.degreeType}","${app.status}","${app.submittedAt}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="applications-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: applications,
        exportedAt: new Date().toISOString(),
        totalRecords: applications.length,
      });
    }

  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/admin/settings - Get system settings
router.get('/settings', async (req, res) => {
  try {
    const settingsDoc = await collections.settings.doc('general').get();
    
    if (!settingsDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    res.json({
      success: true,
      data: settingsDoc.data(),
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// PUT /api/admin/settings - Update system settings
router.put('/settings', async (req, res) => {
  try {
    const updateData = req.body;
    
    await collections.settings.doc('general').update({
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        updatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

export default router;
