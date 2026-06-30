import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const apiService = {
  // ===========================
  // AUTH
  // ===========================
  login: (data) =>
    api.post('/auth/login', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),

  register: (data) => api.post('/auth/register', data),

  getMe: () => api.get('/auth/me'),

  // ===========================
  // DASHBOARD
  // ===========================
  getDashboard: () => api.get('/dashboard'),

  // ===========================
  // RESUMES
  // ===========================
  getResumes: () => api.get('/resume'),
  getResume: (id) => api.get(`/resume/${id}`),

  uploadResume: async (formData) => {
    try {
      console.log("========== UPLOAD START ==========");
      console.log(formData);

      const response = await api.post(
        '/resume/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("UPLOAD SUCCESS");
      console.log(response);

      return response;
    } catch (error) {
      console.log("========== UPLOAD ERROR ==========");
      console.log(error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
        console.log("Headers:", error.response.headers);
      } else if (error.request) {
        console.log("No response received");
        console.log(error.request);
      } else {
        console.log("Request setup error");
        console.log(error.message);
      }

      throw error;
    }
  },

  analyzeResume: (id) => api.post(`/resume/analyze/${id}`),

  deleteResume: (id) => api.delete(`/resume/${id}`),

  // ===========================
  // JOBS
  // ===========================
  getJobs: () => api.get('/job'),
  getJob: (id) => api.get(`/job/${id}`),

  uploadJobText: (data) =>
    api.post('/job/upload/text', data),

  uploadJobPdf: (formData) =>
    api.post('/job/upload/pdf', formData),

  deleteJob: (id) => api.delete(`/job/${id}`),

  matchJob: (resumeId, jobId) =>
    api.post(`/job/match?resume_id=${resumeId}&job_id=${jobId}`),

  // ===========================
  // AI
  // ===========================
  getSkillGap: (resumeId) =>
    api.get(`/intelligence/skill-gap/${resumeId}`),

  getRoadmap: (resumeId) =>
    api.get(`/intelligence/roadmap/${resumeId}`),

  getRecommendations: (resumeId) =>
    api.get(`/intelligence/recommendations/${resumeId}`),
};

export default api;