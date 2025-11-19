import express from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import { autenticarToken } from "../middlewares/autenticarToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validate } from "../middlewares/validate.js";
import { itemSchema } from "../validation/itemSchema.js";

const router = express.Router();

/**
 * ROTAS DE ITENS
 *
 * Responsável por todo o CRUD de itens do cardápio do Uaifood.
 * Cada item pertence a uma categoria → relação N:1.
 *
 * 🔒 Segurança
 * - CLIENT pode apenas visualizar itens.
 * - ADMIN pode criar, atualizar e remover (operações sensíveis).
 *
 * 🧠 Decisões importantes:
 * - Toda rota requer autenticação, mesmo as de listagem, para manter coerência
 *   com o restante da API (tudo protegido).
 * - itemSchema garante integridade dos dados (preço, descrição, categoria).
 * - Middlewares seguem a ordem correta:
 *     autenticar → autorizar (se necessário) → validar → controller
 *
 * Swagger documenta exemplos reais para facilitar testes e desenvolvimento.
 */

/**
 * @swagger
 * tags:
 *   - name: Itens
 *     description: CRUD de itens disponíveis no Uaifood
 */


/* ======================================================================
   GET /items
   Lista todos os itens disponíveis (CLIENT / ADMIN)
   ====================================================================== */
/**
 * Apenas autenticação é necessária.
 * Neste ponto front e admin consomem a mesma rota.
 */
/**
 * @swagger
 * /items:
 *   get:
 *     summary: Lista todos os itens com sua categoria
 *     tags: [Itens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 description: "X-Tudo"
 *                 unitPrice: 25.5
 *                 imageUrl: "https://example.com/x-tudo.jpg"
 *                 category:
 *                   id: 1
 *                   description: "Lanches"
 */
router.get("/", autenticarToken, getItems);


/* ======================================================================
   GET /items/:id
   Retorna um item específico por ID
   ====================================================================== */
/**
 * CLIENT e ADMIN podem consultar detalhes.
 * Respeita autenticação e evita acesso anônimo.
 */
/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Obtém um item pelo ID
 *     tags: [Itens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Item encontrado.
 *       404:
 *         description: Item não encontrado.
 */
router.get("/:id", autenticarToken, getItemById);


/* ======================================================================
   POST /items
   Criar novo item (somente ADMIN)
   ====================================================================== */
/**
 * Fluxo completo:
 * 1. autenticarToken → garante identidade
 * 2. authorizeRole("ADMIN") → impede criação por CLIENT
 * 3. validate(itemSchema) → valida estrutura do payload
 *
 * O controller lida com erros do Prisma (categoria inexistente, etc.).
 */
/**
 * @swagger
 * /items:
 *   post:
 *     summary: Cria um novo item (ADMIN)
 *     tags: [Itens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             description: "Suco Natural"
 *             unitPrice: 7.5
 *             imageUrl: "https://example.com/suco.jpg"
 *             categoryId: 3
 *     responses:
 *       201:
 *         description: Item criado com sucesso.
 *       400:
 *         description: Erro de validação.
 *       403:
 *         description: Apenas ADMIN pode criar itens.
 */
router.post(
  "/",
  autenticarToken,
  authorizeRole("ADMIN"),
  validate(itemSchema),
  createItem
);


/* ======================================================================
   PUT /items/:id
   Atualizar um item existente (somente ADMIN)
   ====================================================================== */
/**
 * Mesma lógica do POST:
 * - Autenticar
 * - Autorizar ADMIN
 * - Validar input
 *
 * updateItem já trata P2025, garantindo resposta 404 adequada.
 */
/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Atualiza um item (ADMIN)
 *     tags: [Itens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             description: "X-Bacon"
 *             unitPrice: 22.0
 *             imageUrl: "https://example.com/x-bacon.jpg"
 *             categoryId: 1
 *     responses:
 *       200:
 *         description: Item atualizado.
 *       404:
 *         description: Item não encontrado.
 */
router.put(
  "/:id",
  autenticarToken,
  authorizeRole("ADMIN"),
  validate(itemSchema),
  updateItem
);


/* ======================================================================
   DELETE /items/:id
   Deletar um item existente (somente ADMIN)
   ====================================================================== */
/**
 * Exclusão sensível → somente ADMIN.
 * O controller já trata casos onde o item não existe.
 */
/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Remove um item (ADMIN)
 *     tags: [Itens]
 *     security:
 *       - bearerAuth: []
 *     description: Apenas administradores podem deletar itens.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Item removido.
 *       404:
 *         description: Item não encontrado.
 */
router.delete(
  "/:id",
  autenticarToken,
  authorizeRole("ADMIN"),
  deleteItem
);

export default router;
