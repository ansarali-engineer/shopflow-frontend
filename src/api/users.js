import api from './axios'

// Addresses
export const getAddresses = () =>
  api.get('/users/me/addresses/')

export const createAddress = (data) =>
  api.post('/users/me/addresses/', data)

export const updateAddress = (id, data) =>
  api.put(`/users/me/addresses/${id}/`, data)

export const deleteAddress = (id) =>
  api.delete(`/users/me/addresses/${id}/`)

// Admin
export const getUsers = (params) =>
  api.get('/users/', { params })

export const getUser = (id) =>
  api.get(`/users/${id}/`)

export const updateUser = (id, data) =>
  api.patch(`/users/${id}/`, data)

export const deleteUser = (id) =>
  api.delete(`/users/${id}/`)
