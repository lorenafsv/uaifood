import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Carrega do localStorage quando o app inicia
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Atualiza o localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Adicionar item ao carrinho
  const addToCart = (item) => {
    setCart((prev) => {
      console.log("CARRINHO ANTES:", prev);
      const existing = prev.find((i) => i.id === item.id);

      if (existing) {
        const updated = prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        console.log("CARRINHO DEPOIS:", updated);
        return updated;
      }

      const newCart = [...prev, { ...item, quantity: 1 }];
      console.log("CARRINHO DEPOIS:", newCart);
      return newCart;
    });
  };

  // Remover item
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Alterar quantidade
  const updateQuantity = (id, qty) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  };

  // Limpar carrinho
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
