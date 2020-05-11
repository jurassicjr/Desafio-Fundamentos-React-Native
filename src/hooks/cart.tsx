/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

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

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsList = await AsyncStorage.getItem('@goMarket:cart');
      setProducts(!!productsList && JSON.parse(productsList));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async p => {
      const product = p;
      console.log(typeof products);
      const productIndex = products.findIndex(
        oldProduct => oldProduct.id === product.id,
      );

      if (productIndex >= 0) {
        const productsUpdated = products.map(oldProduct => {
          if (product.id === oldProduct.id) {
            oldProduct.quantity += 1;
          }
          return oldProduct;
        });
        setProducts(productsUpdated);
      } else {
        const newProduct = product;
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);
      }
      // const updatedList = [product];

      // await AsyncStorage.setItem('@goMarket:cart', JSON.stringify(newList));
      //    setProducts(newList);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProductList = products.map(product => {
        if (product.id === id) {
          const newProduct = product;
          newProduct.quantity += 1;
          return newProduct;
        }
        return product;
      });
      await AsyncStorage.setItem(
        '@goMarket:cart',
        JSON.stringify(newProductList),
      );

      setProducts(newProductList);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(p => p.id === id);

      if (!product) return console.log('produto não encontrado');

      if (product.quantity <= 1) {
        const productswithoutProductDecremented = products.filter(
          p => p.id !== id,
        );

        await AsyncStorage.setItem(
          '@goMarket:cart',
          JSON.stringify(productswithoutProductDecremented),
        );

        setProducts(productswithoutProductDecremented);

        return products;
      }

      const productsUpdated = products.map(p => {
        if (p.id === id) {
          const updatedProduct = p;
          updatedProduct.quantity -= 1;
          return updatedProduct;
        }
        return p;
      });

      await AsyncStorage.setItem('@goMarket', JSON.stringify(productsUpdated));

      setProducts(productsUpdated);

      return products;
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
