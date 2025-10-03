import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

export const api = {
  me: () => axios.get('/api/auth/me').then(r => r.data.data),
  updateProfile: (data) => axios.put('/api/auth/profile', data).then(r => r.data.data),
  updatePreferences: (preferences) => axios.put('/api/auth/preferences', preferences).then(r => r.data.data),
  foods: (opts) => {
    const { q = '', mealType, goal, category, tags, page, limit } = (typeof opts === 'string' ? { q: opts } : (opts || {}))
    const params = {}
    if (q) params.q = q
    if (mealType) params.mealType = mealType
    if (goal) params.goal = goal
    if (category) params.category = category
    if (tags) params.tags = Array.isArray(tags) ? tags.join(',') : tags
    if (page) params.page = page
    if (limit) params.limit = limit
    return axios.get('/api/foods', { params }).then(r => r.data.data)
  },
  addMeal: (userId, payload) => axios.post(`/api/meals/${userId}`, payload).then(r => r.data.data),
  getMeals: (userId, date) => axios.get(`/api/meals/${userId}`, { params: { date } }).then(r => r.data.data),
  generateMeals: (userId, startDate, span = 'daily') => axios.post(`/api/meals/${userId}/generate`, { startDate, span }).then(r => r.data.data),
  addProgress: (userId, entry) => axios.post(`/api/progress/${userId}`, entry).then(r => r.data.data),
  recommendations: (userId, date, limit=10, opts={}) => {
    const params = { date, limit }
    if (opts.mealType) params.mealType = opts.mealType
    if (opts.goal) params.goal = opts.goal
    if (opts.sources) params.sources = opts.sources
    return axios.get(`/api/meals/${userId}/recommendations`, { params }).then(r => r.data.data)
  }
}
