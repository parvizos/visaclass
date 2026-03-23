
# VISACLASS - International Student Recruitment Platform for Turkish Universities

A professional, bilingual (English/Russian) platform helping international students apply to universities in Turkey with a complete application system.

---

## 🏠 Public Pages

### 1. Homepage
- Hero section with compelling headline and call-to-action
- Key statistics (100+ universities, student success rate, countries served)
- Featured universities carousel
- Quick search functionality
- Testimonials section
- "Why Study in Turkey" highlights
- Language switcher (English/Russian)

### 2. Universities Listing Page
- Grid/list view of all Turkish universities
- Advanced filtering:
  - Location/City
  - Programs offered
  - Tuition fee range
  - Public/Private
  - Language of instruction
- Search functionality
- Pagination for 100+ universities

### 3. University Detail Page
- University overview and description
- Programs/faculties offered
- Tuition fees and scholarships
- Campus photos gallery
- Location map
- Entry requirements
- "Apply Now" call-to-action

### 4. Programs Page
- Browse by field of study (Engineering, Medicine, Business, Arts, etc.)
- Filter by degree level (Bachelor, Master, PhD)
- Program details and requirements

### 5. Study in Turkey Guide
- Overview of Turkish education system
- Visa requirements and process
- Cost of living breakdown
- Accommodation options
- Student life and culture
- Scholarship opportunities

### 6. About Us Page
- Company mission and story
- Team introduction
- Why choose our services
- Partner universities

### 7. Contact Page
- Contact form
- WhatsApp integration
- Office location and map
- Email and phone details
- FAQ section

---

## 🔐 Student Portal (Authenticated)

### 8. Student Authentication
- Sign up / Login pages
- Email verification
- Password recovery

### 9. Student Dashboard
- Application status overview
- Quick actions
- Notifications
- Profile completion progress

### 10. Application Form (Multi-Step)
- **Step 1**: Personal Information
  - Full name, date of birth, nationality
  - Contact details
- **Step 2**: Educational Background
  - Previous education details
  - Grades/transcripts
- **Step 3**: Program Selection
  - Choose universities (up to 5)
  - Select programs
- **Step 4**: Document Upload
  - Passport copy
  - Diploma/transcripts
  - Language certificates
  - Motivation letter
  - CV/Resume
- **Step 5**: Review & Submit

### 11. My Applications Page
- List of submitted applications
- Status tracking (Submitted → Under Review → Decision)
- View application details
- Download documents

### 12. Profile Settings
- Edit personal information
- Change password
- Notification preferences
- Language preference

---

## 🛠️ Technical Features

### Database Structure
- **Universities table**: Name, city, type, description, programs, fees, images
- **Programs table**: Name, university, degree level, requirements, fees
- **Users/Profiles table**: Student personal information
- **Applications table**: User, university, program, status, documents
- **Documents table**: File storage references

### Backend (Supabase Cloud)
- User authentication with email
- Secure file storage for documents
- Database with Row Level Security
- Multi-language content support

### Design Style
- Professional corporate look
- Clean, trustworthy aesthetic
- University-appropriate color scheme (blues, whites, gold accents)
- Mobile-responsive design
- Easy navigation

---

## 📋 Summary

| Category | Details |
|----------|---------|
| **Pages** | 12+ pages (public + authenticated) |
| **Languages** | English & Russian |
| **User Type** | International Students |
| **Core Features** | University listings, Multi-step applications, Document uploads, Status tracking |
| **Backend** | Lovable Cloud with Supabase (authentication, database, storage) |
| **Design** | Professional Corporate |



