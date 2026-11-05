import api from './axios'

export const getRevenueBySeller = () =>
  api.get('/analytics/reports/revenue-by-seller/')

export const getMonthlySalesByCategory = () =>
  api.get('/analytics/reports/monthly-sales-by-category/')

export const getTopProducts = (limit = 10) =>
  api.get('/analytics/reports/top-products/', { params: { limit } })

export const getFrequentCustomers = (min_orders = 5) =>
  api.get('/analytics/reports/frequent-customers/', { params: { min_orders } })

export const getMonthlyRevenue = () =>
  api.get('/analytics/reports/monthly-revenue/')

export const getOrderStatusSummary = () =>
  api.get('/analytics/reports/order-status-summary/')

export const getCustomerLifetimeValue = () =>
  api.get('/analytics/customers/lifetime-value/')

export const getInventoryAlerts = (threshold = 10) =>
  api.get('/analytics/reports/inventory-alerts/', { params: { threshold } })
