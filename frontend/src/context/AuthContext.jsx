import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL
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

  const value = { token, user, setUser, login, signup, logout, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
