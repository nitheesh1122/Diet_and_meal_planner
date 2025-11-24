import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

// Set base URL immediately when module loads
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://diet-and-meal-planner.onrender.com'
axios.defaults.baseURL = API_BASE_URL

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'))
  const [adminProfile, setAdminProfile] = useState(() => {
    const raw = localStorage.getItem('adminProfile')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      setToken(res.data.token)
      // Apply Authorization header immediately to avoid race before useEffect runs
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      setUser(res.data.data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.data))
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.response?.data?.error || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const loginAdmin = async (email, password) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/admin/login', { email, password })
      setAdminToken(res.data.token)
      setAdminProfile(res.data.data)
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem('adminProfile', JSON.stringify(res.data.data))
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.response?.data?.error || 'Admin login failed' }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (payload) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/signup', payload)
      setToken(res.data.token)
      // Apply Authorization header immediately to avoid race before useEffect runs
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      setUser(res.data.data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.data))
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.response?.data?.error || 'Signup failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const logoutAdmin = () => {
    setAdminToken(null)
    setAdminProfile(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminProfile')
  }

  const value = {
    token,
    setToken,
    user,
    setUser,
    adminToken,
    adminProfile,
    login,
    signup,
    loginAdmin,
    logout,
    logoutAdmin,
    loading
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
