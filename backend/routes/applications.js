import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { queryDatabase } from '../config/database.js';
import { sendEmail } from '../services/emailService.js';
import { validateApplication } from '../middleware/validation.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
});

// POST /api/applications - Submit new application
router.post('/', upload.fields([
  { name: 'passport', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'diploma', maxCount: 1 },
  { name: 'transcript', maxCount: 1 },
  { name: 'englishCertificate', maxCount: 1 },
  { name: 'turkishCertificate', maxCount: 1 },
]), validateApplication, async (req, res) => {
  try {
    // Parse JSON fields
    const personalInfo = JSON.parse(req.body.personalInfo || '{}');
    const academicInfo = JSON.parse(req.body.academicInfo || '{}');
    const financialInfo = JSON.parse(req.body.financialInfo || '{}');
    const agreement = JSON.parse(req.body.agreement || '{}');
    const paymentInfo = JSON.parse(req.body.paymentInfo || '{}');

    const applicationData = {
      personalInfo,
      academicInfo,
      financialInfo,
      agreement,
      paymentInfo,
      documents: {},
      submittedAt: new Date().toISOString(),
      status: 'pending',
      applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };

    // Process uploaded files
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        if (file) {
          applicationData.documents[fieldName] = {
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            path: file.path,
            uploadDate: new Date().toISOString(),
          };
        }
      });
    }

    
    // Save to SQLite database
    const result = await queryDatabase(
      `INSERT INTO applications (
        first_name, last_name, email, phone, nationality, date_of_birth, passport_number,
        applying_for, last_education, gpa, program_language, target_program, target_university,
        can_pay_tuition, needs_scholarship, monthly_budget, tuition_payment,
        application_fee, tuition_fee, total_amount, payment_completed,
        terms_accepted, translation_required, documents, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        personalInfo.firstName,
        personalInfo.lastName,
        personalInfo.email,
        personalInfo.phone,
        personalInfo.nationality,
        personalInfo.dateOfBirth,
        personalInfo.passportNumber,
        academicInfo.applyingFor,
        academicInfo.lastEducation,
        academicInfo.gpa,
        academicInfo.programLanguage,
        academicInfo.targetProgram,
        academicInfo.targetUniversity,
        financialInfo.canPayTuition ? 1 : 0,
        financialInfo.needsScholarship ? 1 : 0,
        financialInfo.monthlyBudget,
        financialInfo.tuitionPayment ? 1 : 0,
        paymentInfo.applicationFee,
        paymentInfo.tuitionFee,
        paymentInfo.totalAmount,
        paymentInfo.paymentCompleted ? 1 : 0,
        agreement.termsAccepted ? 1 : 0,
        agreement.translationRequired ? 1 : 0,
        JSON.stringify(applicationData.documents)
      ]
    );
    
    // Send confirmation email
    try {
      await sendEmail({
        to: personalInfo.email,
        subject: 'Application Submitted Successfully',
        template: 'application_confirmation',
        applicantName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        applicationId: applicationData.applicationId,
        targetProgram: academicInfo.targetProgram,
        targetUniversity: academicInfo.targetUniversity,
        totalAmount: paymentInfo.totalAmount
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: applicationData.applicationId,
        id: result.insertId,
        status: applicationData.status,
        submittedAt: applicationData.submittedAt,
      },
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/applications - Get all applications (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Get all applications from storage
    let applications = await collections.applications.get();
    
    // Filter by status if provided
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    // Sort by submittedAt descending
    applications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      applications = applications.filter(app => 
        app.personalInfo?.firstName?.toLowerCase().includes(searchTerm) ||
        app.personalInfo?.lastName?.toLowerCase().includes(searchTerm) ||
        app.personalInfo?.email?.toLowerCase().includes(searchTerm) ||
        app.applicationId?.toLowerCase().includes(searchTerm)
      );
    }

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
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/applications/:id - Get specific application
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await collections.applications.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
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
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// PUT /api/applications/:id/status - Update application status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason } = req.body;

    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'waitlisted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

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
      statusUpdatedBy: 'admin', // In real app, this would be the admin user ID
    };

    await applicationRef.update(updateData);

    // Send status update email to applicant
    try {
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

// DELETE /api/applications/:id - Delete application (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await collections.applications.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    await collections.applications.doc(id).delete();

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/applications/stats - Get application statistics
router.get('/stats', async (req, res) => {
  try {
    const snapshot = await collections.applications.get();
    const applications = snapshot.docs.map(doc => doc.data());

    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      underReview: applications.filter(app => app.status === 'under_review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      waitlisted: applications.filter(app => app.status === 'waitlisted').length,
    };

    // Calculate monthly submissions
    const monthlySubmissions = {};
    applications.forEach(app => {
      const month = new Date(app.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
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
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

export default router;
