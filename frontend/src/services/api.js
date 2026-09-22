import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('schemewise_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper response handler
const handleRequest = async (request) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || error.message || 'Network request failed');
  }
};

// 1. Multi-Agent Conversation
export const chatWithMultiAgent = (data) => {
  return handleRequest(() => api.post('/api/chat/agent', data));
};

// 2. Scheme Search & RAG
export const searchSchemes = (params) => {
  return handleRequest(() => api.post('/api/schemes/search', params));
};

export const fetchAllSchemes = () => {
  return handleRequest(() => api.get('/api/schemes'));
};

export const fetchSchemeById = (schemeId) => {
  return handleRequest(() => api.get(`/api/schemes/${schemeId}`));
};

export const getSchemes = () => {
  return handleRequest(() => api.get('/api/schemes'));
};

export const adminCreateScheme = (schemeData) => {
  return handleRequest(() => api.post('/api/admin/schemes', schemeData));
};

// 3. Eligibility Engine
export const evaluateCitizenEligibility = (profile, userId = 'demo-user-123') => {
  return handleRequest(() => api.post('/api/eligibility/evaluate', { profile, user_id: userId }));
};

export const checkEligibility = (userId = 'demo-user-123') => {
  return handleRequest(() => api.post('/ai/eligibility', { user_id: userId }));
};

// 4. Human-in-the-Loop Application Confirmation & n8n Trigger
export const confirmApplication = (payload) => {
  return handleRequest(() => api.post('/api/applications/confirm', payload));
};

export const fetchApplications = (userId = 'demo-user-123') => {
  return handleRequest(() => api.get(`/api/applications?user_id=${userId}`));
};

export const getApplicationsByUser = (userId = 'demo-user-123') => {
  return handleRequest(() => api.get(`/api/applications?user_id=${userId}`));
};

export const createApplication = (appData) => {
  return handleRequest(() => api.post('/applications', appData));
};

// 5. Document Management & OCR
export const uploadCitizenDocument = (file, userId = 'demo-user-123', docType = 'id_proof') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  formData.append('document_type', docType);

  return handleRequest(() => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));
};

export const uploadDocument = (formData) => {
  return handleRequest(() => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));
};

export const fetchCitizenDocuments = (userId = 'demo-user-123') => {
  return handleRequest(() => api.get(`/api/documents?user_id=${userId}`));
};

export const getDocumentsByUser = (userId = 'demo-user-123') => {
  return handleRequest(() => api.get(`/api/documents?user_id=${userId}`));
};

export const saveDocument = (docData) => {
  return handleRequest(() => api.post('/documents', docData));
};

// 6. n8n Event Logs
export const fetchN8nEvents = () => {
  return handleRequest(() => api.get('/api/n8n/events'));
};

// 7. AI Evaluation Suite
export const fetchEvalMetrics = () => {
  return handleRequest(() => api.get('/api/evaluation/metrics'));
};

export const runEvalBenchmark = () => {
  return handleRequest(() => api.post('/api/evaluation/run'));
};

// 8. User Profile & Demo
export const fetchUserProfile = (userId = 'demo-user-123') => {
  return handleRequest(() => api.get(`/api/users/${userId}`));
};

export const getUserById = (userId = 'demo-user-123') => {
  return handleRequest(() => api.get(`/api/users/${userId}`));
};

export const getUserByEmail = (email) => {
  return handleRequest(() => api.get(`/api/users/demo-user-123`));
};

export const updateUserProfile = (userId, profileData) => {
  return handleRequest(() => api.put(`/api/users/${userId}`, profileData));
};

export const updateUser = (userId, profileData) => {
  return handleRequest(() => api.put(`/api/users/${userId}`, profileData));
};

export const createUser = (userData) => {
  return handleRequest(() => api.post('/api/auth/register', userData));
};

export const runDemo = () => {
  return handleRequest(() => api.get('/api/demo-citizen'));
};

// 9. Auth
export const loginUser = (credentials) => {
  return handleRequest(() => api.post('/api/auth/login', credentials));
};

export const registerUser = (userData) => {
  return handleRequest(() => api.post('/api/auth/register', userData));
};

export default api;
