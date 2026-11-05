import api from './axios'

export const mockProcess = (paymentId, success = true) =>
  api.post(`/payments/mock-process/${paymentId}/`, { success })

export const getPayment = (id) =>
  api.get(`/payments/${id}/`)

export const getOrderPayments = (orderId) =>
  api.get(`/payments/order/${orderId}/`)

export const refundPayment = (id, reason = '') =>
  api.post(`/payments/${id}/refund/`, { reason })
