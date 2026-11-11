const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('campus_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('campus_token', token);
  } else {
    localStorage.removeItem('campus_token');
  }
};

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (studentData) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),
  getMe: () => fetchWithAuth('/auth/me'),
  forgotPassword: (email) =>
    fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Search
  searchLecturers: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/search?${query}`);
  },
  getSuggestions: (q) =>
    fetchWithAuth(`/search/suggestions?q=${encodeURIComponent(q)}`),
  getFilterOptions: () => fetchWithAuth('/search/filter-options'),

  // Lecturers
  getLecturers: () => fetchWithAuth('/lecturers'),
  getLecturerById: (id) => fetchWithAuth(`/lecturers/${id}`),
  updateLecturerProfile: (id, updates) =>
    fetchWithAuth(`/lecturers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  getLecturerAvailability: (id) =>
    fetchWithAuth(`/lecturers/${id}/availability`),
  addAvailabilitySlot: (id, slot) =>
    fetchWithAuth(`/lecturers/${id}/availability`, {
      method: 'POST',
      body: JSON.stringify(slot),
    }),
  deleteAvailabilitySlot: (id, slotId) =>
    fetchWithAuth(`/lecturers/${id}/availability/${slotId}`, {
      method: 'DELETE',
    }),

  // Appointments
  getAppointments: () => fetchWithAuth('/appointments'),
  bookAppointment: (details) =>
    fetchWithAuth('/appointments', {
      method: 'POST',
      body: JSON.stringify(details),
    }),
  updateAppointmentStatus: (id, status, notes) =>
    fetchWithAuth(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  rescheduleAppointment: (id, newDate, newTime, reason) =>
    fetchWithAuth(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ newDate, newTime, reason }),
    }),
  sendAppointmentReminder: (id) =>
    fetchWithAuth(`/appointments/${id}/remind`, {
      method: 'POST',
    }),

  // Academic (Courses & Units)
  getCourses: () => fetchWithAuth('/academic/courses'),
  addCourse: (course) =>
    fetchWithAuth('/academic/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    }),
  deleteCourse: (id) =>
    fetchWithAuth(`/academic/courses/${id}`, {
      method: 'DELETE',
    }),
  getUnits: () => fetchWithAuth('/academic/units'),
  addUnit: (unit) =>
    fetchWithAuth('/academic/units', {
      method: 'POST',
      body: JSON.stringify(unit),
    }),
  deleteUnit: (id) =>
    fetchWithAuth(`/academic/units/${id}`, {
      method: 'DELETE',
    }),

  // Admin
  createLecturer: (lecturerData) =>
    fetchWithAuth('/admin/lecturers', {
      method: 'POST',
      body: JSON.stringify(lecturerData),
    }),
  updateLecturerByAdmin: (id, data) =>
    fetchWithAuth(`/admin/lecturers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLecturer: (id) =>
    fetchWithAuth(`/admin/lecturers/${id}`, {
      method: 'DELETE',
    }),
  assignLecturerToUnit: (assignment) =>
    fetchWithAuth('/admin/assign-lecturer', {
      method: 'POST',
      body: JSON.stringify(assignment),
    }),
  getStudents: () => fetchWithAuth('/admin/students'),
  createStudent: (studentData) =>
    fetchWithAuth('/admin/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),
  deleteStudent: (id) =>
    fetchWithAuth(`/admin/students/${id}`, {
      method: 'DELETE',
    }),
  getReports: () => fetchWithAuth('/admin/reports'),
  resetSeedData: () =>
    fetchWithAuth('/admin/reset-seed', {
      method: 'POST',
    }),

  // Chat
  getConversation: (otherId) => fetchWithAuth(`/chat/conversation/${otherId}`),
  sendMessage: (receiverId, content) =>
    fetchWithAuth('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),

  // Notifications
  getNotifications: () => fetchWithAuth('/notifications'),
  markNotificationRead: (id) =>
    fetchWithAuth(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    fetchWithAuth('/notifications/mark-all-read', {
      method: 'PUT',
    }),
};
