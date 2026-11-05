import api from './axios'

export const getCart = () =>
  api.get('/cart/')

export const addToCart = (variant_id, quantity) =>
  api.post('/cart/items/', { variant_id, quantity })

export const updateCartItem = (variant_id, quantity) =>
  api.put('/cart/items/', { variant_id, quantity })

export const removeCartItem = (variant_id) =>
  api.delete(`/cart/items/${variant_id}/`)

export const clearCart = () =>
  api.delete('/cart/clear/')
