import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true until initial auth check completes

  // ── Bootstrap: restore session from localStorage ─────────
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(({ data }) => setUser(data.data))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await apiLogin(email, password)
    const { access_token, refresh_token, user: userData } = data.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await apiRegister(formData)
    const { access_token, refresh_token, user: userData } = data.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  const updateUser = useCallback((partial) => {
    setUser((prev) => ({ ...prev, ...partial }))
  }, [])

  const isRole = useCallback((role) => user?.role === role, [user])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, isRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
