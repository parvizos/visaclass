// API service for admin panel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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


// Dashboard API
export const dashboardAPI = {
  getStats: () => apiRequest('/admin/dashboard-stats'),
};

// Applications API
export const adminApplicationAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/applications${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiRequest(`/admin/applications/${id}`),
  
  updateStatus: (id: string, status: 'pending' | 'under_review' | 'accepted' | 'rejected', notes?: string) => 
    apiRequest(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  
  addNote: (id: string, note: string) => apiRequest(`/admin/applications/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  }),
  
  downloadDocument: (id: string, documentType: string) => 
    apiRequest(`/admin/applications/${id}/documents/${documentType}`),
};

// Students API
export const adminStudentAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/students${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiRequest(`/admin/students/${id}`),
  
  getApplications: (id: string) => apiRequest(`/admin/students/${id}/applications`),
  
  sendEmail: (id: string, subject: string, body: string) => 
    apiRequest(`/admin/students/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify({ subject, body }),
    }),
};

// Universities API
export const adminUniversityAPI = {
  getAll: () => apiRequest('/admin/universities'),
  
  getById: (id: string) => apiRequest(`/admin/universities/${id}`),
  
  create: (data: {
    name: string;
    location: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    logo?: string;
  }) => apiRequest('/admin/universities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => apiRequest(`/admin/universities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiRequest(`/admin/universities/${id}`, {
    method: 'DELETE',
  }),
};

// Programs API
export const adminProgramAPI = {
  getAll: () => apiRequest('/admin/programs'),
  
  getByUniversity: (universityId: string) => 
    apiRequest(`/admin/universities/${universityId}/programs`),
  
  create: (data: {
    universityId: string;
    programName: string;
    degreeLevel: string;
    language: string;
    duration: string;
    tuitionFee: number;
    description?: string;
  }) => apiRequest('/admin/programs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => apiRequest(`/admin/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiRequest(`/admin/programs/${id}`, {
    method: 'DELETE',
  }),
};

// Payments API
export const adminPaymentAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/payments${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiRequest(`/admin/payments/${id}`),
  
  refund: (id: string, reason: string) => apiRequest(`/admin/payments/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
};

// Settings API
export const adminSettingsAPI = {
  getEmailSettings: () => apiRequest('/admin/settings/email'),
  
  updateEmailSettings: (settings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
  }) => apiRequest('/admin/settings/email', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
  
  testEmail: (to: string) => apiRequest('/admin/settings/email/test', {
    method: 'POST',
    body: JSON.stringify({ to }),
  }),
};

// Contacts API
export const adminContactAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/contacts${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiRequest(`/contacts/${id}`),
  
  getMessages: (contactId: string) => apiRequest(`/messages/${contactId}`),
  
  sendMessage: (contactId: string, content: string) => 
    apiRequest(`/messages/${contactId}`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        sender: 'admin',
        senderType: 'admin',
        senderName: 'Admin',
      }),
    }),
  
  updateStatus: (id: string, status: string, adminNotes?: string) => 
    apiRequest(`/contacts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    }),
};

// Export all APIs
export default {
  dashboard: dashboardAPI,
  applications: adminApplicationAPI,
  students: adminStudentAPI,
  universities: adminUniversityAPI,
  programs: adminProgramAPI,
  payments: adminPaymentAPI,
  settings: adminSettingsAPI,
  contacts: adminContactAPI,
};
