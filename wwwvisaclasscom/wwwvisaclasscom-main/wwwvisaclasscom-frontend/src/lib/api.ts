// API configuration and service for connecting frontend to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Passenger API
export const passengerAPI = {
  // Get all passengers
  getAll: () => apiRequest('/passengers'),
  
  // Get passenger by ID
  getById: (id: number) => apiRequest(`/passengers/${id}`),
  
  // Create new passenger
  create: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    passport_number?: string;
    nationality?: string;
  }) => apiRequest('/passengers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update passenger
  update: (id: number, data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    passport_number?: string;
    nationality?: string;
  }) => apiRequest(`/passengers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete passenger
  delete: (id: number) => apiRequest(`/passengers/${id}`, {
    method: 'DELETE',
  }),
  
  // Get passenger bookings
  getBookings: (id: number) => apiRequest(`/passengers/${id}/bookings`),
};

// Booking API
export const bookingAPI = {
  // Get all bookings
  getAll: (params?: {
    status?: string;
    payment_status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/bookings${query ? `?${query}` : ''}`);
  },
  
  // Get booking by ID
  getById: (id: number) => apiRequest(`/bookings/${id}`),
  
  // Create new booking
  create: (data: {
    passenger_id: number;
    trip_type: 'one_way' | 'round_trip' | 'multi_city';
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    passengers_count?: number;
    total_amount: number;
    currency?: string;
  }) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update booking
  update: (id: number, data: {
    passenger_id: number;
    trip_type: 'one_way' | 'round_trip' | 'multi_city';
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    passengers_count?: number;
    total_amount: number;
    currency?: string;
  }) => apiRequest(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Cancel booking
  cancel: (id: number, reason?: string) => apiRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  }),
  
  // Search bookings
  search: (query: string, limit?: number) => {
    const params = new URLSearchParams({ limit: limit?.toString() || '20' }).toString();
    return apiRequest(`/bookings/search/${query}${params ? `?${params}` : ''}`);
  },
};

// Payment API
export const paymentAPI = {
  // Create payment intent
  createIntent: (data: {
    booking_id: number;
    amount: number;
    currency?: string;
    payment_method?: string;
  }) => apiRequest('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Confirm payment
  confirm: (data: {
    payment_intent_id: string;
    booking_id: number;
  }) => apiRequest('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Get payment by ID
  getById: (id: number) => apiRequest(`/payments/${id}`),
  
  // Get payments by booking
  getByBooking: (bookingId: number) => apiRequest(`/payments/booking/${bookingId}`),
};

// Health check
export const healthAPI = {
  check: () => apiRequest('/health', {
    // Remove /api prefix for health check
  }).catch(() => ({ status: 'error', message: 'Backend unavailable' })),
};

// Export types
export interface Passenger {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  passport_number?: string;
  nationality?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  passenger_id: number;
  booking_reference: string;
  trip_type: 'one_way' | 'round_trip' | 'multi_city';
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers_count: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at: string;
  passenger?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: number;
  booking_id: number;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  payment_method?: string;
  stripe_receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export default {
  passenger: passengerAPI,
  booking: bookingAPI,
  payment: paymentAPI,
  health: healthAPI,
};
