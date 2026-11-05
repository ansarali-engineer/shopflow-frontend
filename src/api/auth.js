import api from './axios'

export const login = (email, password) =>
  api.post('/auth/login/', { email, password })

export const register = (data) =>
  api.post('/auth/register/', data)

export const refreshToken = (refresh_token) =>
  api.post('/auth/refresh/', { refresh_token })

export const getMe = () =>
  api.get('/auth/me/')

export const updateMe = (data) =>
  api.put('/auth/me/', data)

export const changePassword = (old_password, new_password) =>
  api.post('/auth/change-password/', { old_password, new_password })
