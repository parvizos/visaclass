# VISACLASS Backend

A comprehensive Node.js/Express backend API for the VISACLASS University Application System.

## Features

- **Application Management**: Complete university application processing with file uploads
- **Contact Form**: Handle contact inquiries with email notifications
- **Email Service**: Automated email notifications for applications and contacts
- **Admin Dashboard**: Advanced admin endpoints for application management
- **Firebase Integration**: Cloud Firestore database for data persistence
- **File Upload**: Secure file handling with validation
- **Rate Limiting**: Protection against spam and abuse
- **Validation**: Comprehensive input validation with Joi

## API Endpoints

### Applications
- `POST /api/applications` - Submit new application
- `GET /api/applications` - Get all applications (admin)
- `GET /api/applications/:id` - Get specific application
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete application (admin)
- `GET /api/applications/stats` - Get application statistics

### Contacts
- `POST /api/contacts` - Submit contact form
- `GET /api/contacts` - Get all contacts (admin)
- `GET /api/contacts/:id` - Get specific contact
- `PUT /api/contacts/:id/status` - Update contact status
- `POST /api/contacts/:id/reply` - Reply to contact
- `DELETE /api/contacts/:id` - Delete contact (admin)
- `GET /api/contacts/stats` - Get contact statistics

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/applications` - Get applications with advanced filtering
- `GET /api/admin/contacts` - Get contacts with advanced filtering
- `PUT /api/admin/applications/:id` - Update application
- `GET /api/admin/export/applications` - Export applications data
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

## Setup

### Prerequisites
- Node.js 18+
- Firebase project with Firestore database
- Gmail account for email service

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure Firebase:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Copy the contents to your `.env` file

5. Configure Email Service:
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password
   - Add email credentials to `.env` file

6. Create uploads directory:
```bash
mkdir -p uploads/documents
```

7. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=VISACLASS <noreply@visaclass.com>

# Admin Configuration
ADMIN_EMAIL=admin@visaclass.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

### Applications Collection
```javascript
{
  applicationId: "APP-1234567890-ABC123",
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    // ... other personal fields
  },
  academicInfo: {
    previousEducation: "high_school",
    institutionName: "Harvard University",
    // ... other academic fields
  },
  programSelection: {
    university: "1",
    program: "Engineering",
    degreeType: "bachelor",
    intake: "fall"
  },
  documents: {
    passportCopy: { filename: "uuid-passport.pdf", size: 1024000 },
    // ... other documents
  },
  declaration: {
    informationCorrect: true,
    agreePrivacyPolicy: true,
    agreeTerms: true
  },
  status: "pending",
  submittedAt: "2024-01-01T00:00:00.000Z",
  statusUpdatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Contacts Collection
```javascript
{
  contactId: "CON-1234567890-XYZ789",
  name: "Jane Smith",
  email: "jane@example.com",
  subject: "Application Question",
  message: "How do I apply for scholarships?",
  status: "pending",
  submittedAt: "2024-01-01T00:00:00.000Z"
}
```

## Email Templates

The system includes professional email templates for:
- Application submission confirmation
- Application status updates
- Contact form notifications
- Auto-reply to contact submissions

## Security Features

- Rate limiting on all API endpoints
- Input validation with Joi schemas
- File type and size validation
- CORS configuration
- Helmet.js for security headers
- Environment-based error reporting

## Error Handling

Comprehensive error handling with:
- Validation errors
- File upload errors
- Database errors
- Email service errors
- Structured error responses

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── config/
│   └── firebase.js          # Firebase configuration
├── middleware/
│   └── validation.js        # Input validation middleware
├── routes/
│   ├── applications.js      # Application routes
│   ├── contacts.js          # Contact routes
│   └── admin.js             # Admin routes
├── services/
│   └── emailService.js      # Email service
├── uploads/
│   └── documents/           # Uploaded files
├── server.js                # Main server file
├── package.json
└── .env.example
```

## Deployment

### Using Docker
```bash
# Build image
docker build -t visaclass-backend .

# Run container
docker run -p 5000:5000 --env-file .env visaclass-backend
```

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name visaclass-backend

# Monitor
pm2 monit
```

## Monitoring

- Health check endpoint: `GET /health`
- Application statistics: `GET /api/applications/stats`
- Contact statistics: `GET /api/contacts/stats`
- Dashboard overview: `GET /api/admin/dashboard`

## License

MIT License
