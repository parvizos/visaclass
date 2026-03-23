# VISACLASS Booking System Backend

A comprehensive backend system for VISACLASS booking platform with passenger management, payment processing, and email services.

## Features

- 👥 **Passenger Management**: Create, update, and manage passenger profiles
- 💳 **Payment Processing**: Secure payment handling with Stripe
- 📧 **Email Services**: Automated email notifications with templates
- 🗄️ **Database**: MySQL database with proper schema and relationships
- 🔒 **Security**: Rate limiting, CORS, and input validation
- 📊 **Booking System**: Complete booking lifecycle management

## Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MySQL with mysql2
- **Payments**: Stripe
- **Email**: Nodemailer (Gmail/SendGrid)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8 or higher)
3. **Stripe Account** (for payments)
4. **Email Service** (Gmail or SendGrid)

### Installation

1. Clone and install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=visaclass_booking

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. Set up the database:
```bash
mysql -u root -p < database/schema.sql
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:8080`

## API Endpoints

### Passengers
- `GET /api/passengers` - Get all passengers
- `GET /api/passengers/:id` - Get passenger by ID
- `POST /api/passengers` - Create new passenger
- `PUT /api/passengers/:id` - Update passenger
- `DELETE /api/passengers/:id` - Delete passenger
- `GET /api/passengers/:id/bookings` - Get passenger bookings

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/search/:query` - Search bookings

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/booking/:bookingId` - Get payments by booking
- `POST /api/payments/webhook` - Stripe webhook handler

### Health Check
- `GET /health` - Server health status

## Database Schema

### Tables
- **passengers**: Passenger information and profiles
- **bookings**: Flight bookings and reservations
- **payments**: Payment transactions and status
- **email_logs**: Email delivery tracking

## Email Templates

The system includes automated email templates for:
- Welcome emails for new passengers
- Booking confirmations
- Payment confirmations
- Booking cancellations

## Payment Flow

1. Create booking → Get booking ID
2. Create payment intent → Get client secret
3. Process payment with Stripe → Confirm payment
4. Update booking status → Send confirmation email

## Security Features

- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation with Joi
- SQL injection prevention
- Helmet security headers

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | Database host | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `DB_NAME` | Database name | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `EMAIL_USER` | Email username | Yes |
| `EMAIL_PASS` | Email password | Yes |
| `PORT` | Server port | No (default: 8080) |

## Development

### Running Tests
```bash
npm test
```

### Database Migrations
To update the database schema:
```bash
mysql -u root -p visaclass_booking < database/schema.sql
```

### Email Testing
Test email configuration:
```bash
node -e "import('./services/emailService.js').then(m => m.emailService.testConnection())"
```

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure production Stripe keys
5. Set up monitoring and logging

### Docker Deployment

```bash
docker build -t visaclass-backend .
docker run -p 8080:8080 --env-file .env visaclass-backend
```

## API Examples

### Create Passenger
```bash
curl -X POST http://localhost:8080/api/passengers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "passenger_id": 1,
    "trip_type": "round_trip",
    "origin": "New York",
    "destination": "London",
    "departure_date": "2024-06-15",
    "return_date": "2024-06-22",
    "passengers_count": 1,
    "total_amount": 1200.00,
    "currency": "USD"
  }'
```

### Create Payment Intent
```bash
curl -X POST http://localhost:8080/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 1,
    "amount": 1200.00,
    "currency": "USD"
  }'
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Email Service Not Working**
   - Check email configuration
   - For Gmail, use App Password (not regular password)
   - Verify SMTP settings

3. **Stripe Payments Failing**
   - Verify Stripe API keys
   - Check webhook endpoint configuration
   - Ensure proper amount formatting (cents)

### Logs

Check application logs for detailed error information:
```bash
npm run dev  # Shows detailed logs in development
```

## Support

For technical support:
- Email: admin@visaclass.com
- Check logs for detailed error messages
- Review API documentation for proper request formats

## License

MIT License - see LICENSE file for details
