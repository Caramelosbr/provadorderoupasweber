import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartService } from '../services/cartService'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isLoading: false,

      // Getters
      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      get discount() {
        const coupon = get().coupon
        if (!coupon) return 0
        if (coupon.type === 'percentage') {
          return (get().subtotal * coupon.discount) / 100
        }
        return coupon.discount
      },

      get total() {
        return get().subtotal - get().discount
      },

      // Actions
      fetchCart: async () => {
        set({ isLoading: true })
        try {
          const { data } = await cartService.get()
          set({ 
            items: data.cart.items, 
            coupon: data.cart.coupon,
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
        }
      },

      addItem: async (productId, quantity, variant) => {
        set({ isLoading: true })
        try {
          const { data } = await cartService.addItem({ productId, quantity, variant })
          set({ items: data.cart.items, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.message }
        }
      },

      updateQuantity: async (itemId, quantity) => {
        try {
          const { data } = await cartService.updateQuantity(itemId, quantity)
          set({ items: data.cart.items })
        } catch (error) {
          console.error(error)
        }
      },

      removeItem: async (itemId) => {
        try {
          const { data } = await cartService.removeItem(itemId)
          set({ items: data.cart.items })
        } catch (error) {
          console.error(error)
        }
      },

      clearCart: async () => {
        try {
          await cartService.clear()
          set({ items: [], coupon: null })
        } catch (error) {
          console.error(error)
        }
      },

      applyCoupon: async (code) => {
        try {
          const { data } = await cartService.applyCoupon(code)
          set({ coupon: data.cart.coupon })
          return { success: true }
        } catch (error) {
          return { success: false, error: error.response?.data?.message }
        }
      },

      removeCoupon: async () => {
        try {
          await cartService.removeCoupon()
          set({ coupon: null })
        } catch (error) {
          console.error(error)
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, coupon: state.coupon })
    }
  )
)
