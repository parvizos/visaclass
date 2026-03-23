// API service for connecting to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('token') || localStorage.getItem('auth_token');

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() && { 'Authorization': `Bearer ${getToken()}` }),
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

// Auth API
export const authAPI = {
  login: (email: string, password: string) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  
  me: () => apiRequest('/auth/me'),
};

// Student API
export const studentAPI = {
  getProfile: () => apiRequest('/students/profile'),
  
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    nationality: string;
    passportNumber: string;
  }) => apiRequest('/students/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  getApplications: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/students/applications${query ? `?${query}` : ''}`);
  },
  
  changePassword: (currentPassword: string, newPassword: string) => 
    apiRequest('/students/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Applications API
export const applicationAPI = {
  submit: (formData: FormData) => {
    return fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        ...(getToken() && { 'Authorization': `Bearer ${getToken()}` }),
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Failed to submit application');
      return res.json();
    });
  },
  
  getAll: () => apiRequest('/applications'),
  
  getById: (id: string) => apiRequest(`/applications/${id}`),
  
  cancel: (id: string, reason: string) => apiRequest(`/applications/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
};

// Universities API
export const universityAPI = {
  getAll: () => apiRequest('/universities'),
  
  getById: (id: string) => apiRequest(`/universities/${id}`),
  
  getPrograms: (universityId: string) => apiRequest(`/universities/${universityId}/programs`),
};

// Programs API
export const programAPI = {
  getAll: () => apiRequest('/programs'),
  
  getById: (id: string) => apiRequest(`/programs/${id}`),
};

// Payments API
export const paymentAPI = {
  createIntent: (data: {
    applicationId: string;
    amount: number;
    currency?: string;
  }) => apiRequest('/application-payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  confirm: (paymentIntentId: string, applicationId: string) => 
    apiRequest('/application-payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, applicationId }),
    }),
  
  getHistory: () => apiRequest('/application-payments/history'),
};

// Contact API
export const contactAPI = {
  submit: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => apiRequest('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => apiRequest('/admin/dashboard-stats'),
  
  getAllApplications: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/applications${query ? `?${query}` : ''}`);
  },
  
  updateApplicationStatus: (id: string, status: string, notes?: string) => 
    apiRequest(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  
  getAllStudents: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/students${query ? `?${query}` : ''}`);
  },
  
  getStudentById: (id: string) => apiRequest(`/admin/students/${id}`),
  
  getAllUniversities: () => apiRequest('/admin/universities'),
  
  createUniversity: (data: any) => apiRequest('/admin/universities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateUniversity: (id: string, data: any) => apiRequest(`/admin/universities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteUniversity: (id: string) => apiRequest(`/admin/universities/${id}`, {
    method: 'DELETE',
  }),
  
  getAllPayments: () => apiRequest('/admin/payments'),
  
  getAllPrograms: () => apiRequest('/admin/programs'),
  
  createProgram: (data: any) => apiRequest('/admin/programs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateProgram: (id: string, data: any) => apiRequest(`/admin/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteProgram: (id: string) => apiRequest(`/admin/programs/${id}`, {
    method: 'DELETE',
  }),
  
  sendEmail: (data: {
    to: string;
    subject: string;
    body: string;
  }) => apiRequest('/admin/send-email', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Health check
export const healthAPI = {
  check: () => apiRequest('/health'),
};

export default {
  auth: authAPI,
  student: studentAPI,
  application: applicationAPI,
  university: universityAPI,
  program: programAPI,
  payment: paymentAPI,
  contact: contactAPI,
  admin: adminAPI,
  health: healthAPI,
};
