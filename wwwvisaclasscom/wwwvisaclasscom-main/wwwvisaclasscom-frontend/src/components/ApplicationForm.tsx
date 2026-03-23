import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { 
  Upload, 
  FileText, 
  User, 
  GraduationCap, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Camera,
  BookOpen,
  Languages,
  CreditCard
} from 'lucide-react';

interface ApplicationData {
  personalInfo: {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other' | '';
    dateOfBirth: string;
    nationality: string;
    email: string;
    phone: string;
    address: string;
    passportNumber: string;
    passportExpiryDate: string;
  };
  passportDocuments: {
    passportCopy: File | null;
    passportTranslation: File | null;
  };
  educationInfo: {
    schoolName: string;
    graduationYear: string;
    gpa: string;
    diplomaFile: File | null;
    diplomaTranslation: File | null;
    transcriptFile: File | null;
    transcriptTranslation: File | null;
    diplomaApostille: File | null;
    transcriptApostille: File | null;
    equivalencyCertificate: File | null;
  };
  academicInfo: {
    applyingFor: 'bachelor' | 'master' | 'phd';
    programLanguage: 'english' | 'turkish';
    targetProgram: string;
    targetUniversity: string;
  };
  profilePhoto: File | null;
  languageCertificates: {
    englishCertificate: File | null;
    englishScore: string;
    turkishCertificate: File | null;
    turkishScore: string;
  };
  examResults: {
    examType: 'SAT' | 'ACT' | 'YÖS' | 'Other' | '';
    examScore: string;
    examDocument: File | null;
  };
  motivationLetter: string;
  recommendationLetters: {
    letter1: File | null;
    letter2: File | null;
  };
  additionalInfo: {
    guardianName: string;
    guardianPhone: string;
    emergencyContact: string;
    emergencyPhone: string;
    needsAccommodation: boolean;
    needsAirportPickup: boolean;
  };
  financialInfo: {
    canPayTuition: boolean;
    needsScholarship: boolean;
    monthlyBudget: string;
  };
  paymentInfo: {
    applicationFee: number;
    tuitionFee: number;
    totalAmount: number;
    paymentCompleted: boolean;
    transactionId: string;
  };
  agreement: {
    termsAccepted: boolean;
    translationRequired: boolean;
  };
}

const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ApplicationData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      nationality: '',
      email: '',
      phone: '',
      address: '',
      passportNumber: '',
      passportExpiryDate: '',
    },
    passportDocuments: {
      passportCopy: null,
      passportTranslation: null,
    },
    educationInfo: {
      schoolName: '',
      graduationYear: '',
      gpa: '',
      diplomaFile: null,
      diplomaTranslation: null,
      transcriptFile: null,
      transcriptTranslation: null,
      diplomaApostille: null,
      transcriptApostille: null,
      equivalencyCertificate: null,
    },
    academicInfo: {
      applyingFor: 'bachelor',
      programLanguage: 'english',
      targetProgram: '',
      targetUniversity: '',
    },
    profilePhoto: null,
    languageCertificates: {
      englishCertificate: null,
      englishScore: '',
      turkishCertificate: null,
      turkishScore: '',
    },
    examResults: {
      examType: '',
      examScore: '',
      examDocument: null,
    },
    motivationLetter: '',
    recommendationLetters: {
      letter1: null,
      letter2: null,
    },
    additionalInfo: {
      guardianName: '',
      guardianPhone: '',
      emergencyContact: '',
      emergencyPhone: '',
      needsAccommodation: false,
      needsAirportPickup: false,
    },
    financialInfo: {
      canPayTuition: false,
      needsScholarship: false,
      monthlyBudget: '',
    },
    paymentInfo: {
      applicationFee: 700,
      tuitionFee: 0,
      totalAmount: 700,
      paymentCompleted: false,
      transactionId: '',
    },
    agreement: {
      termsAccepted: false,
      translationRequired: false,
    },
  });

  const universities = [
    { name: 'Istanbul University', type: 'Public', tuitionRange: '$500 - $2,000', averageTuition: 1250 },
    { name: 'Boğaziçi University', type: 'Public', tuitionRange: '$300 - $1,500', averageTuition: 900 },
    { name: 'Middle East Technical University', type: 'Public', tuitionRange: '$400 - $1,800', averageTuition: 1100 },
    { name: 'Koç University', type: 'Private', tuitionRange: '$15,000 - $25,000', averageTuition: 20000 },
    { name: 'Bilkent University', type: 'Private', tuitionRange: '$12,000 - $20,000', averageTuition: 16000 },
    { name: 'Sabancı University', type: 'Private', tuitionRange: '$18,000 - $28,000', averageTuition: 23000 },
  ];

  const programs = [
    'Medicine',
    'Engineering',
    'Business Administration',
    'Computer Science',
    'Architecture',
    'Law',
    'Psychology',
    'Dentistry',
  ];

  const nationalities = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];

  const handleInputChange = (section: keyof ApplicationData, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section] as any;
      
      // Handle nested fields (e.g., "passportCopy" in passportDocuments)
      if (field.includes('.') || typeof value === 'object') {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value,
          },
        };
      }
      
      const newData = {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value,
        },
      };

      // Update tuition fee when university is selected
      if (section === 'academicInfo' && field === 'targetUniversity') {
        const university = universities.find(u => u.name === value);
        if (university) {
          newData.paymentInfo = {
            ...prev.paymentInfo,
            tuitionFee: university.averageTuition,
            totalAmount: prev.paymentInfo.applicationFee + university.averageTuition,
          };
        }
      }

      return newData;
    });
  };

  const handleFileUpload = (section: keyof ApplicationData, field: string, file: File | null) => {
    handleInputChange(section, field, file);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.personalInfo.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.personalInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.personalInfo.email.trim()) newErrors.email = 'Email is required';
      if (!formData.personalInfo.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.personalInfo.nationality) newErrors.nationality = 'Nationality is required';
      if (!formData.personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.personalInfo.passportNumber.trim()) newErrors.passportNumber = 'Passport number is required';
    }

    if (step === 2) {
      if (!formData.educationInfo.schoolName.trim()) newErrors.schoolName = 'School name is required';
      if (!formData.educationInfo.graduationYear) newErrors.graduationYear = 'Graduation year is required';
      if (!formData.educationInfo.gpa.trim()) newErrors.gpa = 'GPA is required';
      if (!formData.academicInfo.targetProgram) newErrors.targetProgram = 'Target program is required';
      if (!formData.academicInfo.targetUniversity) newErrors.targetUniversity = 'Target university is required';
    }

    if (step === 3) {
      if (!formData.passportDocuments.passportCopy) newErrors.passportCopy = 'Passport copy is required';
      if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
      if (!formData.educationInfo.diplomaFile) newErrors.diplomaFile = 'Diploma is required';
      if (!formData.educationInfo.transcriptFile) newErrors.transcriptFile = 'Transcript is required';
      
      if (formData.academicInfo.programLanguage === 'english' && !formData.languageCertificates.englishCertificate) {
        newErrors.englishCertificate = 'English certificate is required for English programs';
      }
      
      if (formData.academicInfo.programLanguage === 'turkish' && !formData.languageCertificates.turkishCertificate) {
        newErrors.turkishCertificate = 'Turkish certificate is required for Turkish programs';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form data
      submitData.append('personalInfo', JSON.stringify(formData.personalInfo));
      submitData.append('educationInfo', JSON.stringify(formData.educationInfo));
      submitData.append('academicInfo', JSON.stringify(formData.academicInfo));
      submitData.append('financialInfo', JSON.stringify(formData.financialInfo));
      submitData.append('paymentInfo', JSON.stringify(formData.paymentInfo));
      submitData.append('additionalInfo', JSON.stringify(formData.additionalInfo));
      submitData.append('agreement', JSON.stringify(formData.agreement));
      
      // Add files
      if (formData.passportDocuments.passportCopy) submitData.append('passport', formData.passportDocuments.passportCopy);
      if (formData.passportDocuments.passportTranslation) submitData.append('passportTranslation', formData.passportDocuments.passportTranslation);
      if (formData.profilePhoto) submitData.append('photo', formData.profilePhoto);
      if (formData.educationInfo.diplomaFile) submitData.append('diploma', formData.educationInfo.diplomaFile);
      if (formData.educationInfo.diplomaTranslation) submitData.append('diplomaTranslation', formData.educationInfo.diplomaTranslation);
      if (formData.educationInfo.transcriptFile) submitData.append('transcript', formData.educationInfo.transcriptFile);
      if (formData.educationInfo.transcriptTranslation) submitData.append('transcriptTranslation', formData.educationInfo.transcriptTranslation);
      if (formData.educationInfo.diplomaApostille) submitData.append('diplomaApostille', formData.educationInfo.diplomaApostille);
      if (formData.educationInfo.transcriptApostille) submitData.append('transcriptApostille', formData.educationInfo.transcriptApostille);
      if (formData.educationInfo.equivalencyCertificate) submitData.append('equivalencyCertificate', formData.educationInfo.equivalencyCertificate);
      if (formData.languageCertificates.englishCertificate) submitData.append('englishCertificate', formData.languageCertificates.englishCertificate);
      if (formData.languageCertificates.turkishCertificate) submitData.append('turkishCertificate', formData.languageCertificates.turkishCertificate);
      if (formData.examResults.examDocument) submitData.append('examDocument', formData.examResults.examDocument);
      if (formData.recommendationLetters.letter1) submitData.append('recommendationLetter1', formData.recommendationLetters.letter1);
      if (formData.recommendationLetters.letter2) submitData.append('recommendationLetter2', formData.recommendationLetters.letter2);

      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Application submission failed');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your application has been successfully submitted. We will review your documents and contact you within 3-5 business days.
              </p>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Please prepare notarized Turkish translations of your diploma and transcript for final registration in Turkey.
                </AlertDescription>
              </Alert>
              <Button onClick={() => window.location.href = '/'}>
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Academic</span>
            <span>Documents</span>
            <span>Financial</span>
            <span>Review</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🇹🇷 Apply to Turkish Universities
            </CardTitle>
            <CardDescription className="text-center">
              Complete your application in 5 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.personalInfo.firstName}
                      onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.personalInfo.lastName}
                      onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Select value={formData.personalInfo.nationality} onValueChange={(value) => handleInputChange('personalInfo', 'nationality', value)}>
                      <SelectTrigger className={errors.nationality ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities.map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>
                            {nationality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                      className={errors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="passportNumber">Passport Number *</Label>
                  <Input
                    id="passportNumber"
                    value={formData.personalInfo.passportNumber}
                    onChange={(e) => handleInputChange('personalInfo', 'passportNumber', e.target.value)}
                    className={errors.passportNumber ? 'border-red-500' : ''}
                  />
                  {errors.passportNumber && <p className="text-red-500 text-sm mt-1">{errors.passportNumber}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Academic Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                </div>

                <div>
                  <Label htmlFor="applyingFor">Applying For *</Label>
                  <Select value={formData.academicInfo.applyingFor} onValueChange={(value: 'bachelor' | 'master' | 'phd') => handleInputChange('academicInfo', 'applyingFor', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    placeholder="Enter your school/university name"
                    value={formData.educationInfo.schoolName}
                    onChange={(e) => handleInputChange('educationInfo', 'schoolName', e.target.value)}
                    className={errors.schoolName ? 'border-red-500' : ''}
                  />
                  {errors.schoolName && <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      placeholder="e.g., 2023"
                      value={formData.educationInfo.graduationYear}
                      onChange={(e) => handleInputChange('educationInfo', 'graduationYear', e.target.value)}
                      className={errors.graduationYear ? 'border-red-500' : ''}
                    />
                    {errors.graduationYear && <p className="text-red-500 text-sm mt-1">{errors.graduationYear}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="gpa">GPA *</Label>
                    <Input
                      id="gpa"
                      placeholder="e.g., 3.5 or 85%"
                      value={formData.educationInfo.gpa}
                      onChange={(e) => handleInputChange('educationInfo', 'gpa', e.target.value)}
                      className={errors.gpa ? 'border-red-500' : ''}
                    />
                    {errors.gpa && <p className="text-red-500 text-sm mt-1">{errors.gpa}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="programLanguage">Program Language *</Label>
                  <Select value={formData.academicInfo.programLanguage} onValueChange={(value: 'english' | 'turkish') => handleInputChange('academicInfo', 'programLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="turkish">Turkish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetProgram">Target Program *</Label>
                  <Select value={formData.academicInfo.targetProgram} onValueChange={(value) => handleInputChange('academicInfo', 'targetProgram', value)}>
                    <SelectTrigger className={errors.targetProgram ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your target program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.targetProgram && <p className="text-red-500 text-sm mt-1">{errors.targetProgram}</p>}
                </div>

                <div>
                  <Label htmlFor="targetUniversity">Target University *</Label>
                  <Select value={formData.academicInfo.targetUniversity} onValueChange={(value) => handleInputChange('academicInfo', 'targetUniversity', value)}>
                    <SelectTrigger className={errors.targetUniversity ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your target university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem key={university.name} value={university.name}>
                          <div className="flex flex-col">
                            <span>{university.name}</span>
                            <span className="text-xs text-gray-500">{university.type} • {university.tuitionRange}/year</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.targetUniversity && <p className="text-red-500 text-sm mt-1">{errors.targetUniversity}</p>}
                </div>

                {formData.academicInfo.targetUniversity && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Payment Summary:</strong><br/>
                      • Application Fee: $700 (required)<br/>
                      • Tuition Fee: ${formData.paymentInfo.tuitionFee.toLocaleString()}/year<br/>
                      • <strong>Total Amount: ${formData.paymentInfo.totalAmount.toLocaleString()}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Languages className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Language Requirements:</strong><br/>
                    • English programs: IELTS/TOEFL certificate required<br/>
                    • Turkish programs: TÖMER certificate or 1-year Turkish prep class
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Required Documents</h3>
                </div>

                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Documents in English are accepted during application. 
                    Turkish notarized translations are required only during final registration in Turkey.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Passport Copy *
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('passportDocuments', 'passportCopy', e.target.files?.[0] || null)}
                      className={errors.passportCopy ? 'border-red-500' : ''}
                    />
                    {errors.passportCopy && <p className="text-red-500 text-sm mt-1">{errors.passportCopy}</p>}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Passport Translation (if needed)
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('passportDocuments', 'passportTranslation', e.target.files?.[0] || null)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Biometric Photo (Passport-size) *
                    </Label>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('profilePhoto', '', e.target.files?.[0] || null)}
                      className={errors.profilePhoto ? 'border-red-500' : ''}
                    />
                    {errors.profilePhoto && <p className="text-red-500 text-sm mt-1">{errors.profilePhoto}</p>}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Diploma / High School Certificate *
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('educationInfo', 'diplomaFile', e.target.files?.[0] || null)}
                      className={errors.diplomaFile ? 'border-red-500' : ''}
                    />
                    {errors.diplomaFile && <p className="text-red-500 text-sm mt-1">{errors.diplomaFile}</p>}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Diploma Translation (if not English/Turkish)
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('educationInfo', 'diplomaTranslation', e.target.files?.[0] || null)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Transcript (All Years) *
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('educationInfo', 'transcriptFile', e.target.files?.[0] || null)}
                      className={errors.transcriptFile ? 'border-red-500' : ''}
                    />
                    {errors.transcriptFile && <p className="text-red-500 text-sm mt-1">{errors.transcriptFile}</p>}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Transcript Translation (if needed)
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('educationInfo', 'transcriptTranslation', e.target.files?.[0] || null)}
                    />
                  </div>

                  {formData.academicInfo.programLanguage === 'english' && (
                    <div>
                      <Label className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        English Certificate (IELTS/TOEFL) *
                      </Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('languageCertificates', 'englishCertificate', e.target.files?.[0] || null)}
                        className={errors.englishCertificate ? 'border-red-500' : ''}
                      />
                      {errors.englishCertificate && <p className="text-red-500 text-sm mt-1">{errors.englishCertificate}</p>}
                      <Input
                        placeholder="Enter your score (e.g., IELTS 6.5)"
                        className="mt-2"
                        value={formData.languageCertificates.englishScore}
                        onChange={(e) => handleInputChange('languageCertificates', 'englishScore', e.target.value)}
                      />
                    </div>
                  )}

                  {formData.academicInfo.programLanguage === 'turkish' && (
                    <div>
                      <Label className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Turkish Certificate (TÖMER) *
                      </Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('languageCertificates', 'turkishCertificate', e.target.files?.[0] || null)}
                        className={errors.turkishCertificate ? 'border-red-500' : ''}
                      />
                      {errors.turkishCertificate && <p className="text-red-500 text-sm mt-1">{errors.turkishCertificate}</p>}
                      <Input
                        placeholder="Enter your score/level"
                        className="mt-2"
                        value={formData.languageCertificates.turkishScore}
                        onChange={(e) => handleInputChange('languageCertificates', 'turkishScore', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Translation Requirements</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="diplomaTranslation"
                          checked={formData.agreement.translationRequired}
                          onCheckedChange={(checked) => 
                            handleInputChange('agreement', 'translationRequired', checked as boolean)
                          }
                        />
                        <Label htmlFor="diplomaTranslation" className="text-sm">
                          My diploma is not in English or Turkish (requires translation)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="transcriptTranslation"
                          checked={formData.agreement.translationRequired}
                          onCheckedChange={(checked) => 
                            handleInputChange('agreement', 'translationRequired', checked as boolean)
                          }
                        />
                        <Label htmlFor="transcriptTranslation" className="text-sm">
                          My transcript is not in English or Turkish (requires translation)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Financial Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Financial Information</h3>
                </div>

                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tuition Fees (Annual):</strong><br/>
                    • Public Universities: $500 - $2,000<br/>
                    • Private Universities: $12,000 - $28,000<br/>
                    • Living Costs: $430 - $880 per month
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canPayTuition"
                      checked={formData.financialInfo.canPayTuition}
                      onCheckedChange={(checked) => handleInputChange('financialInfo', 'canPayTuition', checked)}
                    />
                    <Label htmlFor="canPayTuition">
                      I can afford the tuition fees for my target program
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needsScholarship"
                      checked={formData.financialInfo.needsScholarship}
                      onCheckedChange={(checked) => handleInputChange('financialInfo', 'needsScholarship', checked)}
                    />
                    <Label htmlFor="needsScholarship">
                      I would like to apply for scholarships
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="monthlyBudget">Monthly Budget for Living Expenses</Label>
                    <Select value={formData.financialInfo.monthlyBudget} onValueChange={(value) => handleInputChange('financialInfo', 'monthlyBudget', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your monthly budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300-500">$300 - $500</SelectItem>
                        <SelectItem value="500-800">$500 - $800</SelectItem>
                        <SelectItem value="800-1200">$800 - $1,200</SelectItem>
                        <SelectItem value="1200+">$1,200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tuitionPayment"
                      checked={formData.financialInfo.canPayTuition}
                      onCheckedChange={(checked) => handleInputChange('financialInfo', 'canPayTuition', checked)}
                    />
                    <Label htmlFor="tuitionPayment">
                      I agree to pay the application and tuition fees
                    </Label>
                  </div>

                  {formData.academicInfo.targetUniversity && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-blue-900 mb-4">Payment Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Application Fee (non-refundable):</span>
                            <span className="font-bold">$700</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tuition Fee ({formData.academicInfo.targetUniversity}):</span>
                            <span className="font-bold">${formData.paymentInfo.tuitionFee.toLocaleString()}/year</span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between text-lg font-bold text-blue-900">
                              <span>Total Payment:</span>
                              <span>${formData.paymentInfo.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Application fee is due immediately. Tuition fee can be paid after acceptance.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Review & Submit</h3>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Name:</strong> {formData.personalInfo.firstName} {formData.personalInfo.lastName}</p>
                      <p><strong>Email:</strong> {formData.personalInfo.email}</p>
                      <p><strong>Phone:</strong> {formData.personalInfo.phone}</p>
                      <p><strong>Nationality:</strong> {formData.personalInfo.nationality}</p>
                      <p><strong>Date of Birth:</strong> {formData.personalInfo.dateOfBirth}</p>
                      <p><strong>Passport:</strong> {formData.personalInfo.passportNumber}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Applying For:</strong> {formData.academicInfo.applyingFor}</p>
                      <p><strong>School Name:</strong> {formData.educationInfo.schoolName}</p>
                      <p><strong>GPA:</strong> {formData.educationInfo.gpa}</p>
                      <p><strong>Program Language:</strong> {formData.academicInfo.programLanguage}</p>
                      <p><strong>Target Program:</strong> {formData.academicInfo.targetProgram}</p>
                      <p><strong>Target University:</strong> {formData.academicInfo.targetUniversity}</p>
                    </CardContent>
                  </Card>

                  {formData.academicInfo.targetUniversity && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Payment Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Application Fee:</span>
                          <span className="font-bold text-blue-600">$700</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tuition Fee (annual):</span>
                          <span className="font-bold text-blue-600">${formData.paymentInfo.tuitionFee.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-lg font-bold text-blue-900">
                            <span>Total Amount:</span>
                            <span>${formData.paymentInfo.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>• Application fee due immediately</p>
                          <p>• Tuition fee payable after acceptance</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Documents Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        {formData.passportDocuments.passportCopy ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        <span>Passport Copy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.profilePhoto ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        <span>Biometric Photo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.educationInfo.diplomaFile ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        <span>Diploma</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.educationInfo.transcriptFile ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        <span>Transcript</span>
                      </div>
                      {formData.academicInfo.programLanguage === 'english' && (
                        <div className="flex items-center gap-2">
                          {formData.languageCertificates.englishCertificate ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                          <span>English Certificate</span>
                        </div>
                      )}
                      {formData.academicInfo.programLanguage === 'turkish' && (
                        <div className="flex items-center gap-2">
                          {formData.languageCertificates.turkishCertificate ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                          <span>Turkish Certificate</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important Notice:</strong><br/>
                      • After acceptance, you'll need notarized Turkish translations for final registration<br/>
                      • Some programs require "Denklik" (equivalency certificate)<br/>
                      • Student visa application requires financial documents
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="termsAccepted"
                      checked={formData.agreement.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange('agreement', 'termsAccepted', checked)}
                    />
                    <Label htmlFor="termsAccepted">
                      I understand the requirements and agree to the terms and conditions
                    </Label>
                  </div>

                  {errors.submit && (
                    <Alert className="border-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-600">
                        {errors.submit}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !formData.agreement.termsAccepted}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationForm;
