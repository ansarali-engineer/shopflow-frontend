import api from './axios'

export const addStock = (data) =>
  api.post('/inventory/add-stock/', data)

export const getVariantStock = (variantId) =>
  api.get(`/inventory/variants/${variantId}/`)

export const getMovements = (params) =>
  api.get('/inventory/movements/', { params })

export const getLowStock = (threshold = 10) =>
  api.get('/inventory/low-stock/', { params: { threshold } })

export const reconcileStock = (variantId) =>
  api.get(`/inventory/reconcile/${variantId}/`)
