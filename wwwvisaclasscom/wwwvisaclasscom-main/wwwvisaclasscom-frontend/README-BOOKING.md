# VISACLASS Frontend - Booking System Integration

This document explains how the frontend connects to the backend booking system.

## 🚀 Quick Start

### Prerequisites
- Backend server running on `http://localhost:8081`
- Node.js and npm installed

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Access the booking system**:
   - Main booking page: `http://localhost:5173/booking-system`
   - Create booking: `http://localhost:5173/booking`
   - View bookings: `http://localhost:5173/bookings`

## 🏗️ Architecture

### API Layer (`src/lib/api.ts`)
- Centralized API configuration
- Type-safe request/response handling
- Error handling and logging
- Support for all backend endpoints

### Custom Hooks (`src/hooks/`)
- `useBookingAPI.ts` - Booking operations and caching
- `usePassengerAPI.ts` - Passenger management
- `usePaymentAPI.ts` - Payment processing with Stripe

### Components
- `BookingPage.tsx` - Complete booking flow
- `BookingDashboard.tsx` - Booking management interface
- `BookingNavigation.tsx` - Main navigation hub

## 📱 Features

### Booking Flow
1. **Passenger Information** - Collect passenger details
2. **Booking Details** - Flight selection and dates
3. **Payment** - Stripe integration (test mode)
4. **Confirmation** - Email notifications and booking reference

### Dashboard Features
- Real-time booking statistics
- Search and filtering
- Booking status management
- Payment tracking
- Cancellation handling

## 🔗 API Integration

### Configuration
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
```

### Available Endpoints
```typescript
// Passengers
GET    /api/passengers
POST   /api/passengers
GET    /api/passengers/:id
PUT    /api/passengers/:id
DELETE /api/passengers/:id

// Bookings
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
PATCH  /api/bookings/:id/cancel

// Payments
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/:id
```

## 💳 Payment Integration

### Stripe Configuration
- Test mode enabled by default
- Mock payment flow for development
- Production keys needed for live payments

### Payment Flow
1. Create payment intent
2. Process payment with Stripe
3. Confirm payment and update booking
4. Send confirmation email

## 🎨 UI Components

### Using Shadcn/UI
- Pre-built components for consistency
- Responsive design
- Dark mode support
- Accessibility features

### Key Components
- Forms with validation
- Data tables with pagination
- Status badges and indicators
- Loading states and error handling

## 🔧 Development

### Environment Variables
```env
VITE_API_URL=http://localhost:8081/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_ENABLE_BOOKING=true
VITE_ENABLE_PAYMENTS=true
```

### Testing API Connection
```typescript
import { healthAPI } from '@/lib/api';

const checkBackend = async () => {
  try {
    const health = await healthAPI.check();
    console.log('Backend status:', health);
  } catch (error) {
    console.error('Backend unavailable:', error);
  }
};
```

## 🚨 Error Handling

### Global Error Handling
- API request errors are caught and logged
- User-friendly error messages
- Toast notifications for feedback
- Fallback UI for failed requests

### Common Issues
1. **Backend not running**: Start the backend server first
2. **CORS errors**: Check backend CORS configuration
3. **Network issues**: Verify API URL in environment
4. **Type errors**: Ensure TypeScript types match API responses

## 📊 State Management

### React Query Integration
- Automatic caching and refetching
- Optimistic updates
- Background synchronization
- DevTools support

### Query Keys
```typescript
['bookings']           // All bookings
['booking', id]        // Single booking
['passengers']         // All passengers
['passenger', id]      // Single passenger
['payments', bookingId] // Payments for booking
```

## 🔄 Data Flow

1. **User Action** → Component Event
2. **Component** → Custom Hook
3. **Hook** → API Service
4. **API Service** → Backend
5. **Backend** → Database/Stripe
6. **Response** → Cache Update
7. **UI** → Automatic Re-render

## 🎯 Best Practices

### API Calls
- Use custom hooks, not direct API calls
- Handle loading and error states
- Implement optimistic updates
- Cache data appropriately

### Component Design
- Keep components small and focused
- Use proper TypeScript types
- Implement proper error boundaries
- Test user interactions

### Performance
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Debounce search inputs
- Lazy load non-critical components

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time booking updates
- [ ] Advanced search filters
- [ ] Booking analytics
- [ ] Mobile app support
- [ ] Multi-language support

### Technical Improvements
- [ ] WebSocket integration
- [ ] Offline support
- [ ] Progressive Web App
- [ ] Advanced caching strategies

## 🐛 Troubleshooting

### Common Issues and Solutions

**Backend Connection Failed**
```bash
# Check if backend is running
curl http://localhost:8081/health

# Start backend server
cd backend && npm start
```

**CORS Errors**
- Verify backend CORS settings
- Check API URL in .env file
- Ensure both services use correct ports

**Payment Issues**
- Check Stripe keys in both frontend and backend
- Verify webhook configuration
- Test with different card numbers

**State Not Updating**
- Check React Query DevTools
- Verify query keys match
- Look for cache invalidation issues

## 📞 Support

For technical support:
1. Check browser console for errors
2. Verify backend server status
3. Review network tab in DevTools
4. Check environment variables
5. Consult API documentation

---

**Note**: This is a development setup. For production, ensure proper security measures, HTTPS, and production API keys are configured.
