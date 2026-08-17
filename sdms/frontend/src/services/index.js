import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (payload) => api.post('/auth/register', payload),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.put('/auth/change-password', payload),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (payload) => api.post('/students', payload),
  update: (id, payload) => api.put(`/students/${id}`, payload),
  remove: (id) => api.delete(`/students/${id}`),
  exportCsv: () => api.get('/students/export/csv', { responseType: 'blob' }),
  smartInsights: () => api.get('/students/insights/smart'),
};

export const facultyService = {
  getAll: (params) => api.get('/faculty', { params }),
  getOne: (id) => api.get(`/faculty/${id}`),
  create: (payload) => api.post('/faculty', payload),
  update: (id, payload) => api.put(`/faculty/${id}`, payload),
  remove: (id) => api.delete(`/faculty/${id}`),
  assignCourse: (id, courseId) => api.put(`/faculty/${id}/assign-course`, { courseId }),
};

export const courseService = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (payload) => api.post('/courses', payload),
  update: (id, payload) => api.put(`/courses/${id}`, payload),
  remove: (id) => api.delete(`/courses/${id}`),
  assignStudent: (id, studentId) => api.put(`/courses/${id}/assign-student`, { studentId }),
};

export const departmentService = {
  getAll: () => api.get('/departments'),
  getOne: (id) => api.get(`/departments/${id}`),
  create: (payload) => api.post('/departments', payload),
  update: (id, payload) => api.put(`/departments/${id}`, payload),
  remove: (id) => api.delete(`/departments/${id}`),
};

export const attendanceService = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (payload) => api.post('/attendance', payload),
  update: (id, payload) => api.put(`/attendance/${id}`, payload),
  remove: (id) => api.delete(`/attendance/${id}`),
  history: (studentId) => api.get(`/attendance/student/${studentId}`),
};

export const markService = {
  getAll: (params) => api.get('/marks', { params }),
  create: (payload) => api.post('/marks', payload),
  update: (id, payload) => api.put(`/marks/${id}`, payload),
  remove: (id) => api.delete(`/marks/${id}`),
  studentSummary: (studentId) => api.get(`/marks/student/${studentId}`),
};

export const feeService = {
  getAll: (params) => api.get('/fees', { params }),
  create: (payload) => api.post('/fees', payload),
  update: (id, payload) => api.put(`/fees/${id}`, payload),
  remove: (id) => api.delete(`/fees/${id}`),
  receipt: (id) => api.get(`/fees/${id}/receipt`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const dashboardService = {
  get: () => api.get('/dashboard'),
};

export const reportService = {
  students: (params) => api.get('/reports/students', { params }),
  attendance: (params) => api.get('/reports/attendance', { params }),
  marks: (params) => api.get('/reports/marks', { params }),
  fees: (params) => api.get('/reports/fees', { params }),
  faculty: (params) => api.get('/reports/faculty', { params }),
  departments: () => api.get('/reports/departments'),
};

export const searchService = {
  search: (q) => api.get('/search', { params: { q } }),
};
