import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], subtotal: '0.00', item_count: 0 })
  const [cartLoading, setCartLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user || user.role === 'seller' || user.role === 'admin') return
    setCartLoading(true)
    try {
      const { data } = await getCart()
      setCart(data.data)
    } catch {
      // silently ignore — not critical
    } finally {
      setCartLoading(false)
    }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = useCallback(async (variantId, quantity = 1) => {
    await addToCart(variantId, quantity)
    await fetchCart()
  }, [fetchCart])

  const updateItem = useCallback(async (variantId, quantity) => {
    if (quantity <= 0) {
      await removeCartItem(variantId)
    } else {
      await updateCartItem(variantId, quantity)
    }
    await fetchCart()
  }, [fetchCart])

  const removeItem = useCallback(async (variantId) => {
    await removeCartItem(variantId)
    await fetchCart()
  }, [fetchCart])

  const emptyCart = useCallback(async () => {
    await clearCart()
    await fetchCart()
  }, [fetchCart])

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, fetchCart, addItem, updateItem, removeItem, emptyCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
