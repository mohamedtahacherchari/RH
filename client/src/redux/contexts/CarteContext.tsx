// File: src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Typage d'un article du panier
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// Typage du contexte
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  calculateTotal: () => number;
  clearCart: () => void;
  itemCount: number;
}

// Contexte typé
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personnalisé avec sécurité
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Typage des props pour le provider
interface CartProviderProps {
  children: ReactNode;
}

// Fonction pour charger le panier depuis le localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);
  const [itemCount, setItemCount] = useState<number>(0);

  // Mettre à jour le localStorage à chaque changement du panier
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    setItemCount(cart.reduce((acc, item) => acc + item.quantity, 0));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Vérifier si l'article existe déjà
      const existingItemIndex = prevCart.findIndex((i) => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité et le total
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        updatedCart[existingItemIndex].total = 
          updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
        return updatedCart;
      }
      
      // Ajouter un nouvel article
      return [...prevCart, { ...item, total: item.price * item.quantity }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1);
      return updatedCart;
    });
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = quantity;
      updatedCart[index].total = updatedCart[index].price * quantity;
      return updatedCart;
    });
  };

  const calculateTotal = (): number => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};