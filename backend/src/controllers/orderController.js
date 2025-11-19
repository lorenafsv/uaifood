import prisma from "../../prisma/client.js";

/**
 * CONTROLLER DE PEDIDOS (Order)
 *
 * Este módulo gerencia toda a lógica relacionada aos pedidos:
 *  - Cliente pode criar e visualizar seus próprios pedidos.
 *  - Administrador pode visualizar e alterar pedidos de todos.
 *
 * Detalhe importante:
 *  - Cada pedido possui itens (OrderItem), que referenciam itens do cardápio.
 *  - O total do pedido é calculado dinamicamente logo após a criação.
 *  - Há um fluxo rígido de mudança de status, garantindo integridade operacional.
 */

// ========================================
// CLIENTE - CRIAR PEDIDO
// ========================================
export const createOrder = async (req, res) => {
  try {
    // O ID do cliente vem diretamente do token JWT,
    // garantindo que nenhum usuário crie pedido em nome de outro.
    const clientId = req.user.id;
    const { paymentMethod, items } = req.body;

    // Validação básica antes de tocar no banco.
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "O pedido deve ter ao menos 1 item." });
    }

    /**
     * 1️⃣ Criação inicial do pedido
     *
     * O total ainda não é calculado aqui,
     * pois precisamos buscar cada item (com preço) depois da criação,
     * e isso só é possível incluindo `item` no relacionamento.
     */
    const order = await prisma.order.create({
      data: {
        clientId,
        paymentMethod,
        status: "pending", // status inicial fixo
        total: 0,          // será recalculado
        orderItems: {
          create: items.map((i) => ({
            itemId: i.itemId,
            quantity: i.quantity,
          })),
        },
      },
      include: {
        orderItems: { include: { item: true } }, // necessário para calcular total
        client: true,
      },
    });

    /**
     * 2️⃣ Calcula o total com base no preço real do item no banco.
     *
     * Isso reduz a chance de fraude,
     * já que o cliente não envia o preço do item no payload.
     */
    const total = order.orderItems.reduce(
      (sum, oi) => sum + oi.item.unitPrice * oi.quantity,
      0
    );

    /**
     * 3️⃣ Atualiza o pedido com o total calculado.
     *
     * Essa é a abordagem mais segura e consistente
     * quando se trabalha com relacionamentos e cálculos derivados.
     */
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { total },
      include: {
        orderItems: { include: { item: true } },
        client: true,
      },
    });

    return res.status(201).json(updatedOrder);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// CLIENTE - LISTAR SEUS PEDIDOS
// ========================================
export const getMyOrders = async (req, res) => {
  try {
    const clientId = req.user.id;

    /**
     * Busca apenas os pedidos do cliente logado.
     * O orderBy garante que os mais recentes aparecem primeiro.
     */
    const orders = await prisma.order.findMany({
      where: { clientId },
      include: {
        orderItems: { include: { item: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// CLIENTE - VER UM PEDIDO (SE FOR DELE)
// ========================================
export const getMyOrderById = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { id } = req.params;

    // Busca o pedido
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        orderItems: { include: { item: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    // Segurança: cliente não pode ver pedido de outro cliente
    if (order.clientId !== clientId) {
      return res.status(403).json({ message: "Você não pode acessar este pedido." });
    }

    return res.status(200).json(order);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// ADMIN - LISTAR TODOS OS PEDIDOS
// ========================================
export const getOrders = async (req, res) => {
  try {
    /**
     * O admin vê TUDO — por isso inclui cliente + itens.
     */
    const orders = await prisma.order.findMany({
      include: {
        client: true,
        orderItems: { include: { item: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// ADMIN - LISTAR PEDIDOS POR CLIENTE
// ========================================
export const getOrdersByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    /**
     * Permite o admin restringir pedidos por cliente.
     * Muito útil em dashboards de atendimento.
     */
    const orders = await prisma.order.findMany({
      where: { clientId: Number(clientId) },
      include: {
        client: true,
        orderItems: { include: { item: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// ADMIN - VER UM PEDIDO POR ID
// ========================================
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        client: true,
        orderItems: { include: { item: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    return res.status(200).json(order);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// ADMIN - ATUALIZAR STATUS (FLUXO RÍGIDO)
// ========================================

/**
 * Fluxo rígido garante que:
 * - ninguém volta status para evitar inconsistência do delivery
 * - ninguém pula etapas (ex: entregar sem preparar)
 */
const STATUS_FLOW = {
  pending: "preparing",
  preparing: "delivering",
  delivering: "delivered",
  delivered: null, // estado final, sem próximo
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id: Number(id) } });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    // Determina o próximo status permitido
    const nextStatus = STATUS_FLOW[order.status];

    if (!nextStatus) {
      return res.status(400).json({
        message: `O pedido já está em '${order.status}' e não pode avançar.`,
      });
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: nextStatus },
    });

    return res.status(200).json(updated);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
