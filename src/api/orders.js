import api from './axios'

export const checkout = (data) =>
  api.post('/orders/checkout/', data)

export const getOrders = (params) =>
  api.get('/orders/', { params })

export const getOrder = (id) =>
  api.get(`/orders/${id}/`)

export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status/`, { status })
