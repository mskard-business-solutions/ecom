"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem } from "@/components/mini-cart"

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, color: string, size: string) => void
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)

  // Load cart from localStorage on client side
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        setCartItems(parsedCart)
        setCartCount(parsedCart.reduce((count: number, item: CartItem) => count + item.quantity, 0))
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
      setCartCount(cartItems.reduce((count, item) => count + item.quantity, 0))
    } else {
      localStorage.removeItem("cart")
      setCartCount(0)
    }
  }, [cartItems])

  const addToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size,
      )

      if (existingItemIndex > -1) {
        // Update quantity if item exists - Just set the new quantity directly
        const updatedItems = [...prevItems]
        // Here's the fix - increment by the newItem quantity instead of adding to existing quantity
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        }
        return updatedItems
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromCart = (id: string, color: string, size: string) => {
    setCartItems((prevItems) => 
      prevItems.filter(
        (item) => !(item.id === id && item.color === color && item.size === size)
      )
    )
  }

  const updateQuantity = (id: string, color: string, size: string, quantity: number) => {
    setCartItems((prevItems) => 
      prevItems.map((item) => 
        (item.id === id && item.color === color && item.size === size) 
          ? { ...item, quantity } 
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cart")
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}