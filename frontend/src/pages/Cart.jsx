import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  // =====================================================================
  // CONTEXTO DO CARRINHO
  // =====================================================================
  //
  // Aqui buscamos do contexto global todas as funções necessárias:
  // - cart           lista de itens
  // - removeFromCart remove item completamente
  // - updateQuantity aumenta/diminui quantidade (com limite mínimo = 1)
  // - clearCart      apaga o carrinho inteiro
  // =====================================================================
  const { cart, removeFromCart, updateQuantity, clearCart } =
    useContext(CartContext);

  // =====================================================================
  // CÁLCULO DO TOTAL DO PEDIDO
  // =====================================================================
  // O reduce percorre todos os itens somando total = preço × quantidade.
  // =====================================================================
  const total = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // =====================================================================
  // CARINHO VAZIO
  // =====================================================================
  if (cart.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio 😢</h1>

        <Link
          to="/"
          className="text-red-600 font-semibold underline"
        >
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  // =====================================================================
  // CARRINHO COM ITENS
  // =====================================================================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-red-600">Carrinho 🛒</h1>

      {/* -------------------------------------------------------------- */}
      {/* LISTA DE ITENS */}
      {/* -------------------------------------------------------------- */}
      {cart.map((item) => (
        <div
          key={item.id}
          className="bg-white p-4 rounded-xl shadow flex items-center gap-4"
        >
          {/* Imagem do item */}
          <img
            src={item.imageUrl}
            className="w-20 h-20 object-cover rounded-lg"
          />

          {/* Dados do item */}
          <div className="flex-1">
            <h2 className="font-semibold">{item.description}</h2>

            <p className="text-red-600">
              R$ {item.unitPrice.toFixed(2)}
            </p>

            {/* ---------------------------------------------------------- */}
            {/* CONTROLES DE QUANTIDADE */}
            {/* ---------------------------------------------------------- */}
            <div className="flex items-center mt-2 gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-3 py-1 bg-gray-200 rounded-md"
              >
                -
              </button>

              <span className="font-bold">{item.quantity}</span>

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-3 py-1 bg-gray-200 rounded-md"
              >
                +
              </button>
            </div>
          </div>

          {/* Botão remover */}
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 font-semibold"
          >
            Remover
          </button>
        </div>
      ))}

      {/* -------------------------------------------------------------- */}
      {/* TOTAL DO CARRINHO */}
      {/* -------------------------------------------------------------- */}
      <div className="text-right text-xl font-bold">
        Total: R$ {total.toFixed(2)}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* AÇÕES DO CARRINHO */}
      {/* -------------------------------------------------------------- */}
      <div className="flex gap-4">
        <button
          onClick={clearCart}
          className="bg-gray-300 p-3 rounded-xl font-semibold"
        >
          Limpar carrinho
        </button>

        <Link
          to="/checkout"
          className="flex-1 text-center bg-red-500 p-3 rounded-xl text-white font-bold"
        >
          Finalizar Pedido →
        </Link>
      </div>
    </div>
  );
}
