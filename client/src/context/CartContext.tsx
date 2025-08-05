import React, { createContext, useContext, useState, ReactNode } from "react";

// 🛍️ Typage d’un article du panier
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number; // généralement = price * quantity
}

// 🔧 Typage du contexte
interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  calculateTotal: () => number;
  clearCart: () => void;
}

// ✅ Contexte typé
const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ Hook personnalisé avec sécurité
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// ✅ Typage des props pour le provider
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1);
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
        setCart,
        addToCart,
        removeFromCart,
        calculateTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
