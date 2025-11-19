import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getOrders,
  getOrdersByClient,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { autenticarToken } from "../middlewares/autenticarToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validate } from "../middlewares/validate.js";
import { orderSchema } from "../validation/orderSchema.js";

const router = express.Router();

/**
 * ROTAS DE PEDIDOS (ORDER FLOW)
 *
 * Este módulo trata o fluxo completo de pedidos:
 * - CLIENT cria e consulta apenas seus pedidos
 * - ADMIN gerencia TODOS os pedidos
 *
 * 🧠 Decisões importantes do design:
 *
 * 1) Segurança forte:
 *    - CLIENT só pode acessar pedidos onde `clientId === req.user.id`
 *    - ADMIN tem acesso total (gerenciamento)
 *
 * 2) O valor total do pedido é sempre calculado no backend.
 *    → evita fraude, manipulação no frontend e inconsistência nos preços.
 *
 * 3) Fluxo de status é rígido e sequencial:
 *    pending → preparing → delivering → delivered
 *    - Não retrocede
 *    - Não pula etapas
 *
 * 4) Middlewares seguem ordem lógica:
 *    autenticar → autorizar (quando necessário) → validar (quando necessário)
 *
 * 5) Swagger possui exemplos reais para facilitar testes e integração.
 */

/**
 * @swagger
 * tags:
 *   - name: Pedidos
 *     description: Fluxo de pedidos (CLIENT cria, ADMIN gerencia)
 */


/* ======================================================================
   POST /orders
   CLIENT cria um pedido
   ====================================================================== */
/**
 * Middlewares em cascata:
 * - autenticarToken → garante que sabemos o clientId
 * - authorizeRole("CLIENT") → evita que admin crie pedidos (regra do negócio)
 * - validate(orderSchema) → garante integridade da estrutura de items e paymentMethod
 */
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: CLIENT cria um pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - O cliente cria o pedido  
 *       - O total é calculado automaticamente pelo sistema  
 *       - O status inicial é **pending**  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             paymentMethod: "CREDIT"
 *             items:
 *               - itemId: 1
 *                 quantity: 2
 *               - itemId: 3
 *                 quantity: 1
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               clientId: 1
 *               status: "pending"
 *               paymentMethod: "CREDIT"
 *               total: 52.70
 *               createdAt: "2025-11-19T01:20:30.000Z"
 *               orderItems:
 *                 - id: 33
 *                   itemId: 1
 *                   quantity: 2
 *                   item:
 *                     id: 1
 *                     description: "X-Salada"
 *                     unitPrice: 18.90
 *                 - id: 34
 *                   itemId: 3
 *                   quantity: 1
 *                   item:
 *                     id: 3
 *                     description: "Batata Frita"
 *                     unitPrice: 12.90
 *       400:
 *         description: Erro de validação.
 */
router.post(
  "/",
  autenticarToken,
  authorizeRole("CLIENT"),
  validate(orderSchema),
  createOrder
);


/* ======================================================================
   GET /orders/my
   CLIENT lista **somente seus** pedidos
   ====================================================================== */
/**
 * Segurança:
 * - Mesmo sendo GET, CLIENT só enxerga os próprios pedidos (controle no controller).
 * - ADMIN não usa esta rota.
 */
/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: CLIENT lista todos os seus pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista dos pedidos.
 *         content:
 *           application/json:
 *             example:
 *               - id: 12
 *                 total: 52.70
 *                 status: "pending"
 *                 paymentMethod: "CREDIT"
 *                 createdAt: "2025-11-19T01:20:30.000Z"
 *                 orderItems:
 *                   - quantity: 2
 *                     item:
 *                       description: "X-Salada"
 *                       unitPrice: 18.90
 */
router.get(
  "/my",
  autenticarToken,
  authorizeRole("CLIENT"),
  getMyOrders
);


/* ======================================================================
   GET /orders/my/:id
   CLIENT consulta um pedido específico
   ====================================================================== */
/**
 * Observação:
 * - O controller valida se o pedido realmente pertence ao usuário.
 * - Caso contrário → 403 (tentativa de acesso indevido).
 */
/**
 * @swagger
 * /orders/my/{id}:
 *   get:
 *     summary: CLIENT obtém um pedido específico
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         example: 12
 *     responses:
 *       200:
 *         description: Pedido encontrado.
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               total: 52.70
 *               status: "pending"
 *               paymentMethod: "CREDIT"
 *               orderItems:
 *                 - quantity: 2
 *                   item:
 *                     description: "X-Salada"
 *                     unitPrice: 18.90
 *       403:
 *         description: Não autorizado.
 */
router.get(
  "/my/:id",
  autenticarToken,
  authorizeRole("CLIENT"),
  getMyOrderById
);


/* ======================================================================
   GET /orders
   ADMIN vê todos os pedidos do sistema
   ====================================================================== */
/**
 * Apenas admin, pois expõe dados sensíveis (clientes, itens, preços).
 * Usado no painel administrativo.
 */
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: ADMIN lista todos os pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos.
 *         content:
 *           application/json:
 *             example:
 *               - id: 12
 *                 client:
 *                   name: "Ana Souza"
 *                 total: 52.70
 *                 status: "preparing"
 *                 paymentMethod: "CREDIT"
 *                 orderItems:
 *                   - quantity: 2
 *                     item:
 *                       description: "X-Salada"
 */
router.get(
  "/",
  autenticarToken,
  authorizeRole("ADMIN"),
  getOrders
);


/* ======================================================================
   GET /orders/client/:clientId
   ADMIN vê todos os pedidos de um cliente específico
   ====================================================================== */
/**
 * Facilita buscas administrativas: relatórios, auditoria, histórico de uso.
 */
/**
 * @swagger
 * /orders/client/{clientId}:
 *   get:
 *     summary: ADMIN lista pedidos por cliente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         example: 1
 *     responses:
 *       200:
 *         description: Pedidos retornados.
 *         content:
 *           application/json:
 *             example:
 *               - id: 10
 *                 total: 29.90
 *                 status: "delivered"
 */
router.get(
  "/client/:clientId",
  autenticarToken,
  authorizeRole("ADMIN"),
  getOrdersByClient
);


/* ======================================================================
   GET /orders/details/:id
   ADMIN vê detalhes completos de um pedido específico
   ====================================================================== */
/**
 * Essa rota é diferente da anterior porque retorna dados completos
 * incluindo info do cliente e itens detalhados.
 */
/**
 * @swagger
 * /orders/details/{id}:
 *   get:
 *     summary: ADMIN busca detalhes de um pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         example: 15
 *     responses:
 *       200:
 *         description: Detalhes completos.
 *         content:
 *           application/json:
 *             example:
 *               id: 15
 *               total: 42.90
 *               client:
 *                 name: "Carlos Lima"
 *               status: "delivering"
 *               orderItems:
 *                 - quantity: 1
 *                   item:
 *                     description: "Batata Frita"
 *                     unitPrice: 12.90
 *       404:
 *         description: Pedido não encontrado.
 */
router.get(
  "/details/:id",
  autenticarToken,
  authorizeRole("ADMIN"),
  getOrderById
);


/* ======================================================================
   PATCH /orders/status/:id
   ADMIN avança o status do pedido
   ====================================================================== */
/**
 * Fluxo rígido e sequencial implementado no controller:
 *   pending → preparing → delivering → delivered
 *
 * Motivo:
 * - Evita inconsistências no painel do restaurante
 * - Garante previsibilidade do fluxo operacional
 * - Evita retrocessos acidentais
 */
/**
 * @swagger
 * /orders/status/{id}:
 *   patch:
 *     summary: ADMIN avança o status do pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Fluxo rígido:  
 *       **pending → preparing → delivering → delivered**  
 *       Não é permitido retroceder ou pular etapas.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Status atualizado.
 *       400:
 *         description: Pedido já finalizado.
 */
router.patch(
  "/status/:id",
  autenticarToken,
  authorizeRole("ADMIN"),
  updateOrderStatus
);

export default router;
