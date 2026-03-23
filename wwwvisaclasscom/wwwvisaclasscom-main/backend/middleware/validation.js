import Joi from 'joi';

// Personal Information Validation
const personalInfoSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 50 characters',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 50 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  phone: Joi.string().min(10).max(20).required().messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number must be at least 10 characters',
  }),
  dateOfBirth: Joi.date().iso().max('now').required().messages({
    'date.empty': 'Date of birth is required',
    'date.max': 'Date of birth cannot be in the future',
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').default('prefer_not_to_say'),
  nationality: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Nationality is required',
  }),
  passportNumber: Joi.string().min(5).max(20).required().messages({
    'string.empty': 'Passport number is required',
    'string.min': 'Passport number must be at least 5 characters',
  }),
  countryOfResidence: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Country of residence is required',
  }),
});

// Academic Information Validation
const academicInfoSchema = Joi.object({
  previousEducation: Joi.string().valid('high_school', 'bachelor', 'master', 'diploma').required().messages({
    'any.only': 'Please select a valid education level',
    'string.empty': 'Previous education is required',
  }),
  institutionName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Institution name is required',
  }),
  countryOfStudy: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Country of study is required',
  }),
  gpa: Joi.string().required().messages({
    'string.empty': 'GPA is required',
  }),
  gradingScale: Joi.string().valid('4.0', '5.0', '10', '100', 'percentage', 'uk').required().messages({
    'any.only': 'Please select a valid grading scale',
    'string.empty': 'Grading scale is required',
  }),
  graduationYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).required().messages({
    'number.base': 'Graduation year must be a number',
    'number.min': 'Graduation year cannot be before 1950',
    'number.max': 'Graduation year cannot be in the future',
  }),
  englishLevel: Joi.string().valid('none', 'basic', 'intermediate', 'advanced', 'native').required().messages({
    'any.only': 'Please select a valid English level',
    'string.empty': 'English level is required',
  }),
  englishCertificate: Joi.string().valid('ielts', 'toefl', 'cambridge', 'pte', 'other').optional(),
  certificateScore: Joi.string().optional(),
});

// Program Selection Validation
const programSelectionSchema = Joi.object({
  university: Joi.string().required().messages({
    'string.empty': 'University selection is required',
  }),
  program: Joi.string().required().messages({
    'string.empty': 'Program selection is required',
  }),
  degreeType: Joi.string().valid('bachelor', 'master', 'phd').required().messages({
    'any.only': 'Please select a valid degree type',
    'string.empty': 'Degree type is required',
  }),
  intake: Joi.string().valid('fall', 'spring', 'summer').required().messages({
    'any.only': 'Please select a valid intake semester',
    'string.empty': 'Intake semester is required',
  }),
});

// Declaration Validation
const declarationSchema = Joi.object({
  informationCorrect: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must confirm the information is correct',
  }),
  agreePrivacyPolicy: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the privacy policy',
  }),
  agreeTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the terms and conditions',
  }),
});

// Main Application Validation Schema
export const applicationSchema = Joi.object({
  personalInfo: personalInfoSchema.required(),
  academicInfo: academicInfoSchema.required(),
  programSelection: programSelectionSchema.required(),
  declaration: declarationSchema.required(),
  personalStatement: Joi.string().max(2000).optional().messages({
    'string.max': 'Personal statement cannot exceed 2000 characters',
  }),
});

// Contact Form Validation Schema
export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  subject: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Subject is required',
    'string.min': 'Subject must be at least 5 characters',
    'string.max': 'Subject cannot exceed 200 characters',
  }),
  message: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 10 characters',
    'string.max': 'Message cannot exceed 2000 characters',
  }),
  phone: Joi.string().min(10).max(20).optional().messages({
    'string.min': 'Phone number must be at least 10 characters',
  }),
  country: Joi.string().min(2).max(50).optional(),
});

// Application Status Update Validation
export const applicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'under_review', 'approved', 'rejected', 'waitlisted').required().messages({
    'any.only': 'Invalid status value',
    'string.empty': 'Status is required',
  }),
  adminNotes: Joi.string().max(1000).optional().messages({
    'string.max': 'Admin notes cannot exceed 1000 characters',
  }),
  rejectionReason: Joi.string().max(500).optional().messages({
    'string.max': 'Rejection reason cannot exceed 500 characters',
  }),
});

// Export validation middleware
export const validateApplication = (req, res, next) => {
  const { error } = applicationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

export const validateContact = (req, res, next) => {
  const { error } = contactSchema.validate(req.body, { abortEarly: false });
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

export const validateApplicationStatus = (req, res, next) => {
  const { error } = applicationStatusSchema.validate(req.body, { abortEarly: false });
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};
