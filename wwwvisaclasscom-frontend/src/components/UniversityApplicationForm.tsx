import React, { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  GraduationCap, 
  School, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  AlertCircle
} from 'lucide-react';

// Form validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  nationality: z.string().min(2, 'Nationality is required'),
  passportNumber: z.string().min(5, 'Passport number is required'),
  countryOfResidence: z.string().min(2, 'Country of residence is required'),
});

const academicInfoSchema = z.object({
  previousEducation: z.enum(['high_school', 'bachelor', 'master', 'diploma']),
  institutionName: z.string().min(2, 'Institution name is required'),
  countryOfStudy: z.string().min(2, 'Country of study is required'),
  gpa: z.string().min(1, 'GPA is required'),
  gradingScale: z.string().min(1, 'Grading scale is required'),
  graduationYear: z.string().min(4, 'Graduation year is required'),
  englishLevel: z.enum(['none', 'basic', 'intermediate', 'advanced', 'native']),
  englishCertificate: z.string().optional(),
  certificateScore: z.string().optional(),
});

const programSelectionSchema = z.object({
  university: z.string().min(1, 'University is required'),
  program: z.string().min(1, 'Program is required'),
  degreeType: z.enum(['bachelor', 'master', 'phd']),
  intake: z.enum(['fall', 'spring', 'summer']),
});

const documentSchema = z.object({
  passportCopy: z.instanceof(File).optional(),
  diploma: z.instanceof(File).optional(),
  transcript: z.instanceof(File).optional(),
  englishCertificate: z.instanceof(File).optional(),
  motivationLetter: z.instanceof(File).optional(),
  cv: z.instanceof(File).optional(),
});

const declarationSchema = z.object({
  informationCorrect: z.boolean().refine(val => val === true, 'You must confirm the information is correct'),
  agreePrivacyPolicy: z.boolean().refine(val => val === true, 'You must agree to the privacy policy'),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
});

const applicationSchema = z.object({
  personalInfo: personalInfoSchema,
  academicInfo: academicInfoSchema,
  programSelection: programSelectionSchema,
  documents: documentSchema,
  declaration: declarationSchema,
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

// Universities and Programs Data
const universities = [
  { id: '1', name: 'Istanbul University', country: 'Turkey', type: 'Public' },
  { id: '2', name: 'Boğaziçi University', country: 'Turkey', type: 'Public' },
  { id: '3', name: 'Middle East Technical University', country: 'Turkey', type: 'Public' },
  { id: '4', name: 'Koç University', country: 'Turkey', type: 'Private' },
  { id: '5', name: 'Bilkent University', country: 'Turkey', type: 'Private' },
  { id: '6', name: 'Sabancı University', country: 'Turkey', type: 'Private' },
];

const programs = {
  '1': ['Engineering', 'Medicine', 'Business', 'Law', 'Computer Science'],
  '2': ['Engineering', 'Economics', 'Psychology', 'Arts & Humanities'],
  '3': ['Engineering', 'Architecture', 'Science', 'Social Sciences'],
  '4': ['Business', 'Engineering', 'Medicine', 'Law'],
  '5': ['Engineering', 'Business', 'Computer Science', 'Design'],
  '6': ['Engineering', 'Business', 'Arts & Humanities', 'Social Sciences'],
};

const steps = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Academic Background', icon: GraduationCap },
  { id: 3, title: 'Program Selection', icon: School },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Declaration', icon: CheckCircle },
];

interface FileUploadProps {
  label: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  required = false,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5,
  value,
  onChange,
  error
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSize}MB`);
        return;
      }
      onChange(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(`file-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Choose File</span>
        </Button>
        {value && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>{value.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="ml-1 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </Badge>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </p>
      )}
      <p className="text-xs text-gray-500">
        Accepted formats: PDF, JPG, PNG. Max size: {maxSize}MB
      </p>
    </div>
  );
};

// Personal Information Step
const PersonalInfoStep: React.FC<{ control: any; errors: any }> = ({ control, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <p className="text-gray-600">Please provide your personal details as they appear on your passport.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name *</label>
          <input
            {...control.register('personalInfo.firstName')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John"
          />
          {errors.personalInfo?.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Last Name *</label>
          <input
            {...control.register('personalInfo.lastName')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Doe"
          />
          {errors.personalInfo?.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.lastName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address *</label>
          <input
            {...control.register('personalInfo.email')}
            type="email"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="john@example.com"
          />
          {errors.personalInfo?.email && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number *</label>
          <input
            {...control.register('personalInfo.phone')}
            type="tel"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (555) 123-4567"
          />
          {errors.personalInfo?.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date of Birth *</label>
          <input
            {...control.register('personalInfo.dateOfBirth')}
            type="date"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.personalInfo?.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select
            {...control.register('personalInfo.gender')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nationality *</label>
          <input
            {...control.register('personalInfo.nationality')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="United States"
          />
          {errors.personalInfo?.nationality && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.nationality.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Passport Number *</label>
          <input
            {...control.register('personalInfo.passportNumber')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="A12345678"
          />
          {errors.personalInfo?.passportNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.passportNumber.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Country of Residence *</label>
          <input
            {...control.register('personalInfo.countryOfResidence')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="United States"
          />
          {errors.personalInfo?.countryOfResidence && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.countryOfResidence.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Academic Background Step
const AcademicInfoStep: React.FC<{ control: any; errors: any }> = ({ control, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Academic Background</h3>
      <p className="text-gray-600">Please provide your educational history to determine your eligibility.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Previous Education Level *</label>
          <select
            {...control.register('academicInfo.previousEducation')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Education Level</option>
            <option value="high_school">High School</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="diploma">Diploma</option>
          </select>
          {errors.academicInfo?.previousEducation && (
            <p className="text-red-500 text-sm mt-1">{errors.academicInfo.previousEducation.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Institution Name *</label>
          <input
            {...control.register('academicInfo.institutionName')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Harvard University"
          />
          {errors.academicInfo?.institutionName && (
            <p className="text-red-500 text-sm mt-1">{errors.academicInfo.institutionName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Country of Study *</label>
          <input
            {...control.register('academicInfo.countryOfStudy')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="United States"
          />
          {errors.academicInfo?.countryOfStudy && (
            <p className="text-red-500 text-sm mt-1">{errors.academicInfo.countryOfStudy.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">GPA/Final Grade *</label>
          <input
            {...control.register('academicInfo.gpa')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="3.8"
          />
          {errors.academicInfo?.gpa && (
            <p className="text-red-500 text-sm mt-1">{errors.academicInfo.gpa.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Grading Scale *</label>
          <select
            {...control.register('academicInfo.gradingScale')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Grading Scale</option>
            <option value="4.0">4.0 Scale</option>
            <option value="5.0">5.0 Scale</option>
            <option value="10">10 Point Scale</option>
            <option value="100">100 Point Scale</option>
            <option value="percentage">Percentage</option>
            <option value="uk">UK System (First Class, etc.)</option>
          </select>
          {errors.academicInfo?.gradingScale && (
            <p className="text-red-500 text-sm mt-1">{errors.academicInfo.gradingScale.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Graduation Year *</label>
          <input
            {...control.register('academicInfo.graduationYear')}
            type="number"
            min="1950"
            max="2030"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2023"
          />
          {errors.academicInfo?.graduationYear && (
            <p className="text-red-500 text-sm mt-1">{errors.academicInfo.graduationYear.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">English Level *</label>
          <select
            {...control.register('academicInfo.englishLevel')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select English Level</option>
            <option value="none">None</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="native">Native</option>
          </select>
          {errors.academicInfo?.englishLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.academicInfo.englishLevel.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">English Certificate (if applicable)</label>
          <select
            {...control.register('academicInfo.englishCertificate')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Certificate</option>
            <option value="ielts">IELTS</option>
            <option value="toefl">TOEFL</option>
            <option value="cambridge">Cambridge</option>
            <option value="pte">PTE</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Certificate Score (if applicable)</label>
          <input
            {...control.register('academicInfo.certificateScore')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="7.5 for IELTS, 100 for TOEFL, etc."
          />
        </div>
      </div>
    </div>
  );
};

// Program Selection Step
const ProgramSelectionStep: React.FC<{ control: any; errors: any; watch: any }> = ({ control, errors, watch }) => {
  const selectedUniversity = watch('programSelection.university');
  const availablePrograms = selectedUniversity ? programs[selectedUniversity as keyof typeof programs] || [] : [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Program Selection</h3>
      <p className="text-gray-600">Choose your desired university and program of study.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">University *</label>
          <select
            {...control.register('programSelection.university')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select University</option>
            {universities.map(uni => (
              <option key={uni.id} value={uni.id}>
                {uni.name} - {uni.country} ({uni.type})
              </option>
            ))}
          </select>
          {errors.programSelection?.university && (
            <p className="text-red-500 text-sm mt-1">{errors.programSelection.university.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Program *</label>
          <select
            {...control.register('programSelection.program')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedUniversity}
          >
            <option value="">Select Program</option>
            {availablePrograms.map(program => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
          {errors.programSelection?.program && (
            <p className="text-red-500 text-sm mt-1">{errors.programSelection.program.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Degree Type *</label>
          <select
            {...control.register('programSelection.degreeType')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Degree Type</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">Ph.D.</option>
          </select>
          {errors.programSelection?.degreeType && (
            <p className="text-red-500 text-sm mt-1">{errors.programSelection.degreeType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Intake Semester *</label>
          <select
            {...control.register('programSelection.intake')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Intake</option>
            <option value="fall">Fall (September)</option>
            <option value="spring">Spring (February)</option>
            <option value="summer">Summer (June)</option>
          </select>
          {errors.programSelection?.intake && (
            <p className="text-red-500 text-sm mt-1">{errors.programSelection.intake.message}</p>
          )}
        </div>
      </div>

      {selectedUniversity && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Selected University Information</h4>
            {(() => {
              const uni = universities.find(u => u.id === selectedUniversity);
              return uni ? (
                <div className="text-sm text-blue-800">
                  <p><strong>Name:</strong> {uni.name}</p>
                  <p><strong>Country:</strong> {uni.country}</p>
                  <p><strong>Type:</strong> {uni.type}</p>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Document Upload Step
const DocumentUploadStep: React.FC<{ control: any; errors: any; setValue: any; watch: any }> = ({ 
  control, 
  errors, 
  setValue, 
  watch 
}) => {
  const handleFileChange = (fieldName: string, file: File | null) => {
    setValue(`documents.${fieldName}`, file);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Document Upload</h3>
      <p className="text-gray-600">Please upload the required documents for your application.</p>
      
      <div className="space-y-4">
        <FileUpload
          label="Passport Copy"
          required
          value={watch('documents.passportCopy')}
          onChange={(file) => handleFileChange('passportCopy', file)}
        />

        <FileUpload
          label="Diploma/Certificate"
          required
          value={watch('documents.diploma')}
          onChange={(file) => handleFileChange('diploma', file)}
        />

        <FileUpload
          label="Academic Transcript"
          required
          value={watch('documents.transcript')}
          onChange={(file) => handleFileChange('transcript', file)}
        />

        <FileUpload
          label="English Certificate"
          value={watch('documents.englishCertificate')}
          onChange={(file) => handleFileChange('englishCertificate', file)}
        />

        <FileUpload
          label="Motivation Letter"
          value={watch('documents.motivationLetter')}
          onChange={(file) => handleFileChange('motivationLetter', file)}
        />

        <FileUpload
          label="CV/Resume (for Master's programs)"
          value={watch('documents.cv')}
          onChange={(file) => handleFileChange('cv', file)}
        />
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• All documents must be in English or have certified translations</li>
            <li>• Files must be in PDF, JPG, or PNG format</li>
            <li>• Maximum file size is 5MB per document</li>
            <li>• Ensure all documents are clear and readable</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Declaration Step
const DeclarationStep: React.FC<{ control: any; errors: any }> = ({ control, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Declaration & Agreement</h3>
      <p className="text-gray-600">Please review and confirm the following declarations.</p>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <input
                {...control.register('declaration.informationCorrect')}
                type="checkbox"
                className="mt-1"
              />
              <div>
                <label className="font-medium">Information Accuracy</label>
                <p className="text-sm text-gray-600">
                  I hereby declare that all information provided in this application is true, 
                  complete, and accurate to the best of my knowledge.
                </p>
                {errors.declaration?.informationCorrect && (
                  <p className="text-red-500 text-sm mt-1">{errors.declaration.informationCorrect.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <input
                {...control.register('declaration.agreePrivacyPolicy')}
                type="checkbox"
                className="mt-1"
              />
              <div>
                <label className="font-medium">Privacy Policy Agreement</label>
                <p className="text-sm text-gray-600">
                  I have read and agree to the privacy policy regarding the collection, 
                  use, and protection of my personal data.
                </p>
                {errors.declaration?.agreePrivacyPolicy && (
                  <p className="text-red-500 text-sm mt-1">{errors.declaration.agreePrivacyPolicy.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <input
                {...control.register('declaration.agreeTerms')}
                type="checkbox"
                className="mt-1"
              />
              <div>
                <label className="font-medium">Terms and Conditions</label>
                <p className="text-sm text-gray-600">
                  I accept the terms and conditions of the application process and understand 
                  that submission does not guarantee admission.
                </p>
                {errors.declaration?.agreeTerms && (
                  <p className="text-red-500 text-sm mt-1">{errors.declaration.agreeTerms.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-red-900 mb-2">Important Legal Notice</h4>
          <p className="text-sm text-red-800">
            By submitting this application, you confirm that you understand and accept that:
            any false or misleading information may result in the rejection of your application 
            or dismissal if discovered after admission.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Application Form Component
const UniversityApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      personalInfo: {
        gender: 'prefer_not_to_say',
      },
      academicInfo: {
        englishLevel: 'intermediate',
      },
      programSelection: {
        degreeType: 'bachelor',
        intake: 'fall',
      },
      documents: {},
      declaration: {
        informationCorrect: false,
        agreePrivacyPolicy: false,
        agreeTerms: false,
      },
    },
    mode: 'onChange',
  });

  const { control, formState: { errors, isValid }, trigger, watch, setValue, getValues } = methods;

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = Object.keys(personalInfoSchema.shape).map(key => `personalInfo.${key}`);
        break;
      case 2:
        fieldsToValidate = Object.keys(academicInfoSchema.shape).map(key => `academicInfo.${key}`);
        break;
      case 3:
        fieldsToValidate = Object.keys(programSelectionSchema.shape).map(key => `programSelection.${key}`);
        break;
      case 4:
        // Documents are optional, so we don't validate them strictly
        setCurrentStep(currentStep + 1);
        return;
      case 4:
        fieldsToValidate = Object.keys(declarationSchema.shape).map(key => `declaration.${key}`);
        break;
    }

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill in all required fields correctly.');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all form fields
      formData.append('personalInfo', JSON.stringify(data.personalInfo));
      formData.append('academicInfo', JSON.stringify(data.academicInfo));
      formData.append('programSelection', JSON.stringify(data.programSelection));
      formData.append('declaration', JSON.stringify(data.declaration));
      
      if (data.personalStatement) {
        formData.append('personalStatement', data.personalStatement);
      }

      // Add files if they exist
      if (data.documents.passportCopy) {
        formData.append('passportCopy', data.documents.passportCopy);
      }
      if (data.documents.diploma) {
        formData.append('diploma', data.documents.diploma);
      }
      if (data.documents.transcript) {
        formData.append('transcript', data.documents.transcript);
      }
      if (data.documents.englishCertificate) {
        formData.append('englishCertificate', data.documents.englishCertificate);
      }
      if (data.documents.motivationLetter) {
        formData.append('motivationLetter', data.documents.motivationLetter);
      }
      if (data.documents.cv) {
        formData.append('cv', data.documents.cv);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Application submitted successfully! Your application ID is ${result.data.applicationId}. You will receive a confirmation email shortly.`);
        
        // Store application ID for reference
        localStorage.setItem('lastApplicationId', result.data.applicationId);
        localStorage.setItem('lastApplicationData', JSON.stringify({
          ...data,
          applicationId: result.data.applicationId,
          submittedAt: new Date().toISOString(),
        }));
        
        // Reset form after successful submission
        setTimeout(() => {
          methods.reset();
          setCurrentStep(1);
        }, 3000);
      } else {
        toast.error(result.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              University Application Form
            </CardTitle>
            <p className="text-gray-600">
              Apply to top universities with our comprehensive application system
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isActive 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : isCompleted 
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 text-gray-500'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <PersonalInfoStep control={control} errors={errors} />
                )}

                {/* Step 2: Academic Background */}
                {currentStep === 2 && (
                  <AcademicInfoStep control={control} errors={errors} />
                )}

                {/* Step 3: Program Selection */}
                {currentStep === 3 && (
                  <ProgramSelectionStep control={control} errors={errors} watch={watch} />
                )}

                {/* Step 4: Document Upload */}
                {currentStep === 4 && (
                  <DocumentUploadStep 
                    control={control} 
                    errors={errors} 
                    setValue={setValue} 
                    watch={watch} 
                  />
                )}

                {/* Step 5: Declaration */}
                {currentStep === 5 && (
                  <DeclarationStep control={control} errors={errors} />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniversityApplicationForm;
