import { useEffect, useState } from "react";
import API from "../api/api";

// ======================================================================
// DEFINIÇÃO DO FLUXO DE STATUS DO PEDIDO
// ======================================================================
//
// → O backend exige que o status avance em fluxo rígido:
//   pending → preparing → delivering → delivered
//
// - nextStatus: diz qual é o próximo status permitido
// - statusLabels: rótulos amigáveis usados na UI
// - statusColors: classes Tailwind para estilização dinâmica
// ======================================================================

const nextStatus = {
  pending: "preparing",
  preparing: "delivering",
  delivering: "delivered",
};

const statusLabels = {
  pending: "PENDENTE",
  preparing: "PREPARANDO",
  delivering: "SAIU PARA ENTREGA",
  delivered: "ENTREGUE",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  preparing: "bg-blue-100 text-blue-700",
  delivering: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

// ======================================================================
// COMPONENTE AdminOrders
// ======================================================================
// Responsável por:
// - Listar todos os pedidos (somente ADMIN)
// - Exibir itens, cliente, total e status
// - Avançar status do pedido seguindo fluxo controlado
//
// Importante: este componente NÃO permite retroceder status.
// ======================================================================

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);     // lista de pedidos
  const [loading, setLoading] = useState(true); // indicador de carregamento inicial
  const [msg, setMsg] = useState("");           // mensagem global de feedback

  // --------------------------------------------------------------------
  // FUNÇÃO QUE BUSCA TODOS OS PEDIDOS
  // --------------------------------------------------------------------
  // - Atualiza loading para UX responsiva
  // - Em caso de erro, retorna lista vazia sem quebrar a UI
  // --------------------------------------------------------------------
  const loadOrders = () => {
    setLoading(true);

    API.get("/orders")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  // Carrega pedidos ao montar componente
  useEffect(() => {
    loadOrders();
  }, []);

  // --------------------------------------------------------------------
  // AVANÇAR STATUS DO PEDIDO
  // --------------------------------------------------------------------
  // - Chama o backend no endpoint PATCH /orders/status/:id
  // - O backend calcula o próximo status e valida se o fluxo é permitido
  // - Após sucesso → recarrega lista e exibe mensagem
  // --------------------------------------------------------------------
  const updateStatus = async (id) => {
    try {
      await API.patch(`/orders/status/${id}`);

      setMsg("Status atualizado!");
      loadOrders();
    } catch {
      setMsg("Erro ao atualizar status.");
    }
  };

  // =====================================================================
  // RENDER
  // =====================================================================

  // Estado inicial: carregando pedidos
  if (loading) {
    return <div className="p-6 text-center">Carregando pedidos...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-red-600">Gerenciar Pedidos 📦</h1>

      {/* Feedback de sucesso/erro */}
      {msg && <div className="bg-green-100 text-green-700 p-3 rounded-lg">{msg}</div>}

      {/* Caso não existam pedidos */}
      {orders.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        // =================================================================
        // LISTA DE PEDIDOS
        // =================================================================
        orders.map((order) => (
          <div key={order.id} className="bg-white p-5 shadow rounded-xl space-y-4">

            {/* ------------------------------------------------------------- */}
            {/* Cabeçalho: ID do pedido + status visual */}
            {/* ------------------------------------------------------------- */}
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">Pedido #{order.id}</h2>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[order.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {statusLabels[order.status]}
              </span>
            </div>

            {/* Informações do cliente */}
            <p className="text-gray-700">
              Cliente: <strong>{order.client?.name}</strong>
            </p>

            {/* Data de criação formatada */}
            <p className="text-gray-500 text-sm">
              {new Date(order.createdAt).toLocaleString("pt-BR")}
            </p>

            {/* ------------------------------------------------------------- */}
            {/* Itens do pedido */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2">
              {(order.orderItems ?? []).map((item) => (
                <div key={item.id} className="flex justify-between text-gray-800">
                  <span>
                    {item.quantity}× {item.item.description}
                  </span>

                  <span className="font-semibold">
                    R$ {(item.item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total do pedido */}
            <div className="text-right font-bold text-lg text-red-600">
              Total: R$ {order.total?.toFixed(2) ?? "0.00"}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Botão para avançar o status */}
            {/* ------------------------------------------------------------- */}
            {nextStatus[order.status] ? (
              <button
                onClick={() => updateStatus(order.id)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-bold"
              >
                Avançar para {statusLabels[nextStatus[order.status]]}
              </button>
            ) : (
              // Quando o status é "delivered", não há próximo passo
              <p className="text-green-600 font-semibold text-center">
                Pedido concluído ✔
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
