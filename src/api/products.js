import api from './axios'

export const getProducts = (params) =>
  api.get('/products/', { params })

export const getProduct = (id) =>
  api.get(`/products/${id}/`)

export const getCategories = () =>
  api.get('/products/categories/')

export const getCategoryBySlug = (slug) =>
  api.get(`/products/categories/${slug}/`)

export const getTopPerCategory = () =>
  api.get('/products/top-per-category/')

// Seller endpoints
export const getSellerProducts = (params) =>
  api.get('/products/seller/', { params })

export const createProduct = (data) =>
  api.post('/products/seller/create/', data)

export const updateProduct = (id, data) =>
  api.put(`/products/seller/${id}/`, data)

export const addVariant = (productId, data) =>
  api.post(`/products/seller/${productId}/variants/`, data)

export const addProductImage = (productId, data) =>
  api.post(`/products/seller/${productId}/images/`, data)
