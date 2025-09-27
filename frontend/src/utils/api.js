import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

export const api = {
  me: () => axios.get('/api/auth/me').then(r => r.data.data),
  updateProfile: (data) => axios.put('/api/auth/profile', data).then(r => r.data.data),
  foods: (q) => axios.get('/api/foods', { params: { q } }).then(r => r.data.data),
  addMeal: (userId, payload) => axios.post(`/api/meals/${userId}`, payload).then(r => r.data.data),
  getMeals: (userId, date) => axios.get(`/api/meals/${userId}`, { params: { date } }).then(r => r.data.data),
  getProgress: (userId) => axios.get(`/api/progress/${userId}`).then(r => r.data.data),
  addProgress: (userId, entry) => axios.post(`/api/progress/${userId}`, entry).then(r => r.data.data),
  recommendations: (userId, date, limit=10) => axios.get(`/api/meals/${userId}/recommendations`, { params: { date, limit } }).then(r => r.data.data)
}
