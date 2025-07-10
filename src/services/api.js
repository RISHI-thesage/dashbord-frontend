import axios from 'axios';

// Base URL for API - use environment variable for deployment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin-login', credentials),
  logout: () => api.post('/auth/logout'),
  resetPassword: (userId) => api.post('/auth/reset-password', { userId }),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAllUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// Student API calls
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard'),
  getSkillProgress: () => api.get('/students/skills'),
  getProgress: () => api.get('/students/progress'),
  getAssignedMentor: () => api.get('/students/mentor'),
  getUpcomingSessions: () => api.get('/students/sessions'),
  getTasks: () => api.get('/students/tasks'),
  uploadFile: (formData) => api.post('/students/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  requestReschedule: (sessionId, newDate) => api.post('/students/reschedule', { sessionId, newDate }),
  getSubmissions: () => api.get('/students/submissions'),
  getBadges: () => api.get('/students/badges'),
};

// Mentor API calls
export const mentorAPI = {
  getDashboard: () => api.get('/mentors/dashboard'),
  getAssignedStudents: () => api.get('/mentors/students'),
  getStudentProfile: (studentId) => api.get(`/mentors/students/${studentId}`),
  updateStudentSkills: (studentId, skills) => api.put(`/mentors/students/${studentId}/skills`, skills),
  updateStudentProgress: (studentId, progress) => api.put(`/mentors/students/${studentId}/progress`, progress),
  getStudentTasks: (studentId) => api.get(`/mentors/students/${studentId}/tasks`),
  updateTaskStatus: (studentId, taskId, status, feedback) => api.put(`/mentors/students/${studentId}/tasks/${taskId}`, { status, feedback }),
  scheduleSession: (sessionData) => api.post('/mentors/sessions', sessionData),
  completeSession: (sessionId, feedback) => api.put(`/mentors/sessions/${sessionId}/complete`, { feedback }),
  approveReschedule: (sessionId, approved) => api.put(`/mentors/sessions/${sessionId}/reschedule`, { approved }),
  getSubmissions: (studentId) => api.get(`/mentors/submissions/${studentId}`),
  provideFeedback: (submissionId, feedback) => api.post(`/mentors/feedback/${submissionId}`, feedback),
  getSessions: () => api.get('/mentors/sessions'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  assignMentor: (studentId, mentorId) => api.post('/admin/assign-mentor', { studentId, mentorId }),
  getReports: () => api.get('/admin/reports'),
  getSubmissions: () => api.get('/admin/submissions'),
  getMentorPerformance: () => api.get('/admin/mentor-performance'),
  getStudentProgress: () => api.get('/admin/student-progress'),
};

// Session API calls
export const sessionAPI = {
  getAllSessions: () => api.get('/sessions'),
  getUpcomingSessions: () => api.get('/sessions/upcoming'),
  getCompletedSessions: () => api.get('/sessions/completed'),
  createSession: (sessionData) => api.post('/sessions', sessionData),
  updateSession: (sessionId, sessionData) => api.put(`/sessions/${sessionId}`, sessionData),
  deleteSession: (sessionId) => api.delete(`/sessions/${sessionId}`),
  getSessionById: (sessionId) => api.get(`/sessions/${sessionId}`),
  requestReschedule: (sessionId, rescheduleData) => api.post(`/sessions/${sessionId}/reschedule`, rescheduleData),
  approveReschedule: (sessionId, requestId, approved) => api.put(`/sessions/${sessionId}/reschedule/${requestId}`, { approved }),
  completeSession: (sessionId, feedback) => api.put(`/sessions/${sessionId}/complete`, { feedback }),
};

// File upload helpers
export const uploadAPI = {
  uploadFile: (formData, type = 'assignment') => {
    return api.post(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadTask: (formData) => {
    return api.post('/upload/task', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultipleFiles: (formData, type = 'assignment') => {
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  downloadFile: (filename) => {
    return api.get(`/upload/${filename}`);
  },
  
  deleteFile: (filename) => {
    return api.delete(`/upload/${filename}`);
  },
};

// Helper functions
export const authHelpers = {
  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },
  
  removeAuthToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  },
  
  setUserRole: (role) => {
    localStorage.setItem('userRole', role);
  },
  
  getUserRole: () => {
    return localStorage.getItem('userRole');
  },
  
  setUserId: (id) => {
    localStorage.setItem('userId', id);
  },
  
  getUserId: () => {
    return localStorage.getItem('userId');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default api;
