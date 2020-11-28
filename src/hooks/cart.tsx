import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react'

import AsyncStorage from '@react-native-community/async-storage'
import { log } from 'react-native-reanimated'

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null)

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace:products')
      if (cart) {
        setProducts(JSON.parse(cart))
      }
    }
    loadProducts()
  }, [])

  const addToCart = useCallback(
    async (product: Product) => {
      const hasProduct = products.find(prod => prod.id === product.id)

      if (!hasProduct) {
        product.quantity = 1
        setProducts([...products, product])
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        )
      } else {
        const item = products[products.indexOf(hasProduct)]
        item.quantity += 1
        setProducts(
          products.map(obj => (obj.id === item.id ? (obj = item) : obj)),
        )
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        )
      }
    },
    [products],
  )

  const increment = useCallback(
    async id => {
      const item = products.find(prod => prod.id === id)
      if (item) {
        const product = products[products.indexOf(item)]
        product.quantity += 1
        setProducts(
          products.map(obj => (obj.id === product.id ? (obj = product) : obj)),
        )
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        )
      }
    },
    [products],
  )

  const decrement = useCallback(
    async id => {
      const item = products.find(prod => prod.id === id)
      if (item && item.quantity > 0) {
        const product = products[products.indexOf(item)]
        product.quantity -= 1
        setProducts(
          products.map(obj => (obj.id === product.id ? (obj = product) : obj)),
        )
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        )
      }
    },
    [products],
  )

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function useCart(): CartContext {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`)
  }

  return context
}

export { CartProvider, useCart }
