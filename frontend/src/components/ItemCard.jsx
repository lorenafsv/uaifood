import { useContext } from "react";
import { CartContext } from "../context/CartContext";

// ======================================================================
// COMPONENTE DE CARD DO ITEM
// ======================================================================
// Objetivo:
// - Exibir um item do menu com imagem, descrição e preço
// - Garantir que todas as imagens fiquem padronizadas visualmente
// - Permitir adicionar o item ao carrinho via contexto global
// ======================================================================

export default function ItemCard({ item }) {
  // Obtém do contexto a função que adiciona itens ao carrinho
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3 flex flex-col">
      <div className="w-full h-40 flex items-center justify-center bg-white overflow-hidden rounded-lg">
        <img
          src={item.imageUrl}
          alt={item.description}
          className="max-h-full object-contain"
        />
      </div>

      {/* Nome do item */}
      <h3 className="mt-3 font-semibold text-gray-808">
        {item.description}
      </h3>

      {/* Preço — formatado com 2 casas decimais */}
      <p className="text-red-600 font-bold mt-1">
        R$ {item.unitPrice.toFixed(2)}
      </p>

      <button
        onClick={() => {
          console.log("ITEM RECEBIDO NO CARD:", item);
          addToCart(item);
        }}
        className="mt-auto bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg font-semibold transition"
      >
        Adicionar ao carrinho +
      </button>
    </div>
  );
}
