import { useEffect, useState } from "react";
import API from "../api/api";

// ======================================================================
// MAPEAMENTO VISUAL DOS STATUS DO PEDIDO
// ======================================================================
// - statusColors define estilos condizentes com cada estado
// - statusLabels traduz valores técnicos para texto amigável
// ======================================================================
const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  preparing: "bg-blue-100 text-blue-700",
  delivering: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

const statusLabels = {
  pending: "PENDENTE",
  preparing: "PREPARANDO",
  delivering: "SAIU PARA ENTREGA",
  delivered: "ENTREGUE",
};

export default function Orders() {
  // ======================================================================
  // ESTADOS
  // ======================================================================
  // - orders: lista dos pedidos do cliente
  // - loading: controle de carregamento
  // ======================================================================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================================
  // UTILITÁRIO PARA CÁLCULO DO TOTAL
  // ======================================================================
  // - Garante fallback caso orderItems esteja null/undefined
  // - Cálculo simples: soma de (preço × quantidade)
  // ======================================================================
  const calcTotal = (order) =>
    order.orderItems?.reduce(
      (sum, oi) => sum + oi.item.unitPrice * oi.quantity,
      0
    ) ?? 0;

  // ======================================================================
  // CARREGAMENTO INICIAL DOS PEDIDOS
  // ======================================================================
  // - Busca somente pedidos do usuário autenticado (/orders/my)
  // - Em caso de erro, mostra lista vazia sem quebrar a UI
  // ======================================================================
  useEffect(() => {
    API.get("/orders/my")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // ======================================================================
  // ESTADO: CARREGANDO
  // ======================================================================
  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Carregando pedidos...
      </div>
    );
  }

  // ======================================================================
  // CASO NÃO EXISTA NENHUM PEDIDO
  // ======================================================================
  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Você ainda não tem pedidos 😢</h1>
        <a href="/" className="text-red-600 font-semibold underline">
          Fazer primeiro pedido
        </a>
      </div>
    );
  }

  // ======================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ======================================================================
  // - Mostra a lista completa dos pedidos
  // - Cada pedido exibe:
  //     • status
  //     • data
  //     • itens
  //     • total calculado
  // ======================================================================
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-red-600">Meus Pedidos 📦</h1>

      {orders.map((order) => (
        <div key={order.id} className="bg-white p-5 rounded-xl shadow space-y-3">

          {/* STATUS DO PEDIDO */}
          <div
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              statusColors[order.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {statusLabels[order.status] ?? order.status}
          </div>

          {/* DATA DO PEDIDO */}
          <div className="text-gray-500 text-sm">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </div>

          {/* LISTA DE ITENS DO PEDIDO */}
          <div className="space-y-2">
            {order.orderItems?.map((oi) => (
              <div key={oi.id} className="flex justify-between text-gray-800">
                <span>
                  {oi.quantity}× {oi.item.description}
                </span>

                <span className="font-semibold">
                  R$ {(oi.item.unitPrice * oi.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* TOTAL DO PEDIDO */}
          <div className="text-right font-bold text-lg text-red-600">
            Total: R$ {calcTotal(order).toFixed(2)}
          </div>

        </div>
      ))}
    </div>
  );
}
