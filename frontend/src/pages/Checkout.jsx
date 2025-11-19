import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Checkout() {
  const navigate = useNavigate();

  // =====================================================================
  // CONTEXTOS
  // =====================================================================
  //
  // - CartContext: carrinho e função para limpá-lo
  // - AuthContext: dados do usuário (principalmente id e endereço)
  //
  // O Checkout depende de ambos: do carrinho e do usuário logado.
  // =====================================================================
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  // =====================================================================
  // ESTADOS LOCAIS
  // =====================================================================
  //
  // - paymentMethod → método de pagamento escolhido
  // - loading       → controla botão enquanto envia pedido
  // - errorMsg      → mensagens amigáveis ao usuário
  //
  // Estado mínimo = componente simples de manter e debugar.
  // =====================================================================
  const [paymentMethod, setPaymentMethod] = useState("CREDIT");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // =====================================================================
  // CÁLCULO DO TOTAL DO PEDIDO
  // =====================================================================
  // Mesmo padrão usado no carrinho:
  // soma = preço × quantidade
  // =====================================================================
  const total = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // =====================================================================
  // HANDLE CHECKOUT — regra central
  // =====================================================================
  //
  // Este é o fluxo principal da finalização do pedido:
  //
  // 1. Verifica se o carrinho está vazio
  // 2. Verifica se o cliente possui endereço cadastrado
  // 3. Monta payload com itens
  // 4. Envia para backend (/orders)
  // 5. Limpa carrinho
  // 6. Redireciona para histórico de pedidos (/orders)
  //
  // O objetivo é manter UX fluida e proteger o backend
  // com mensagens de erro genéricas.
  // =====================================================================
  const handleCheckout = async () => {
    // (1) Carrinho vazio
    if (cart.length === 0) {
      setErrorMsg("Seu carrinho está vazio.");
      return;
    }

    // (2) Verifica endereço cadastrado
    try {
      await API.get("/addresses/me");
    } catch (err) {
      setErrorMsg("Cadastre seu endereço antes de finalizar o pedido.");
      return navigate("/address");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // (3) Monta corpo da requisição conforme contrato da API
      const payload = {
        paymentMethod,
        items: cart.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        })),
      };

      // (4) Envia pedido ao backend
      await API.post("/orders", payload);

      // (5) Limpa carrinho local
      clearCart();

      // (6) Redireciona para tela de pedidos do cliente
      navigate("/orders");

    } catch (err) {
      // Erros específicos são ocultados → segurança e UX
      setErrorMsg("Erro ao finalizar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================
  // CASO O CARRINHO ESTEJA VAZIO
  // =====================================================================
  // Evita que o usuário veja tela de checkout improdutiva.
  // =====================================================================
  if (cart.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Carrinho vazio 😢
        </h1>

        <button
          onClick={() => navigate("/")}
          className="text-red-500 underline"
        >
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  // =====================================================================
  // TELA PRINCIPAL DE CHECKOUT
  // =====================================================================
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-red-600">Finalizar Pedido</h1>

      {/* -------------------------------------------------------------- */}
      {/* MENSAGEM DE ERRO */}
      {/* -------------------------------------------------------------- */}
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* LISTA DE ITENS DO PEDIDO */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-xl shadow flex justify-between"
          >
            {/* Informações principais do item */}
            <div>
              <p className="font-semibold">{item.description}</p>
              <p className="text-gray-500 text-sm">
                {item.quantity} × R$ {item.unitPrice.toFixed(2)}
              </p>
            </div>

            {/* Subtotal */}
            <p className="font-bold">
              R$ {(item.unitPrice * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* TOTAL DO PEDIDO */}
      {/* -------------------------------------------------------------- */}
      <div className="text-right text-2xl font-bold text-red-600">
        Total: R$ {total.toFixed(2)}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* MÉTODO DE PAGAMENTO */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-2">
        <label className="font-semibold">Forma de Pagamento</label>

        <select
          className="w-full border p-3 rounded-lg bg-white"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="CREDIT">Crédito</option>
          <option value="DEBIT">Débito</option>
          <option value="PIX">PIX</option>
          <option value="CASH">Dinheiro</option>
        </select>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* BOTÃO DE CONFIRMAÇÃO */}
      {/* -------------------------------------------------------------- */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl font-bold text-lg disabled:opacity-50"
      >
        {loading ? "Processando pedido..." : "Confirmar Pedido"}
      </button>
    </div>
  );
}
