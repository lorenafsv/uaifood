import { useContext } from "react";
import { CartContext } from "../context/CartContext";

// ======================================================================
// COMPONENTE DE CARD DO ITEM
// ======================================================================
// Objetivo:
// - Exibir um item do menu com imagem, descrição e preço
// - Garantir que todas as imagens fiquem padronizadas visualmente
// - Permitir adicionar o item ao carrinho via contexto global
//
// Observação:
// A padronização visual é crítica, pois as imagens têm proporções diferentes.
// Por isso usamos um "container fixo" + object-contain.
// ======================================================================

export default function ItemCard({ item }) {
  // Obtém do contexto a função que adiciona itens ao carrinho
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3 flex flex-col">
      
      {/* --------------------------------------------------------------
          1️⃣ CONTAINER FIXO DE IMAGEM
          
          - Altura fixa (h-40) para uniformizar todos os cards.
          - items-center / justify-center centraliza em qualquer proporção.
          - overflow-hidden impede que imagens "estourem" para fora.
          - object-contain garante que a imagem se ajuste sem cortar.
         -------------------------------------------------------------- */}
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

      {/* --------------------------------------------------------------
          2️⃣ BOTÃO "Adicionar ao carrinho"
          
          - mt-auto empurra o botão para a base do card.
          - addToCart adiciona o item com quantity = 1 ou incrementa.
          - O console.log ajuda durante o desenvolvimento/debug.
         -------------------------------------------------------------- */}
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
