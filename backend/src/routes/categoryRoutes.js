import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { autenticarToken } from "../middlewares/autenticarToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validate } from "../middlewares/validate.js";
import { categorySchema } from "../validation/categorySchema.js";

const router = express.Router();

/**
 * ROTAS DE CATEGORIAS
 *
 * Aqui ficam todas as operações relacionadas às categorias dos itens do cardápio.
 *
 * 🔐 Segurança:
 * - Apenas ADMIN pode criar, atualizar ou deletar categorias.
 * - CLIENT pode apenas listar e consultar categorias.
 *
 * 🧩 Decisões de arquitetura:
 * - Listagens são abertas para qualquer usuário autenticado (CLIENT e ADMIN).
 * - categorySchema garante que a descrição é valida e evita strings vazias.
 * - A ordem dos middlewares importa: autenticar → autorizar → validar → controller.
 *
 * O Swagger documenta as operações para facilitar o uso no front e nos testes.
 */

/**
 * @swagger
 * tags:
 *   - name: Categorias
 *     description: CRUD de categorias de itens
 */


/* ======================================================================
   GET /categories
   Lista todas as categorias (CLIENT e ADMIN)
   ====================================================================== */
/**
 * Observação:
 * - Apenas garante que o usuário está autenticado.
 * - Retorna categorias com seus respectivos itens.
 */
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso.
 */
router.get("/", autenticarToken, getCategories);


/* ======================================================================
   GET /categories/:id
   Obtém uma categoria específica
   ====================================================================== */
/**
 * Qualquer usuário autenticado pode consultar.
 */
/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtém uma categoria pelo ID
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoria encontrada.
 *       404:
 *         description: Categoria não encontrada.
 */
router.get("/:id", autenticarToken, getCategoryById);


/* ======================================================================
   POST /categories
   Cria uma nova categoria (apenas ADMIN)
   ====================================================================== */
/**
 * Fluxo de middlewares:
 * 1. autenticarToken → valida JWT
 * 2. authorizeRole("ADMIN") → garante permissão
 * 3. validate(categorySchema) → valida a entrada
 */
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria (ADMIN)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     description: Apenas administradores podem criar categorias.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             description: "Lanches"
 *     responses:
 *       201:
 *         description: Categoria criada.
 *       400:
 *         description: Erro de validação.
 *       403:
 *         description: Permissão negada.
 */
router.post(
  "/",
  autenticarToken,
  authorizeRole("ADMIN"),
  validate(categorySchema),
  createCategory
);


/* ======================================================================
   PUT /categories/:id
   Atualiza uma categoria (apenas ADMIN)
   ====================================================================== */
/**
 * Mesmo pipeline de segurança do POST:
 * - Autenticação
 * - Autorização
 * - Validação de body
 */
/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria (ADMIN)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     description: Apenas administradores podem atualizar categorias.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             description: "Sobremesas"
 *     responses:
 *       200:
 *         description: Categoria atualizada.
 *       404:
 *         description: Categoria não encontrada.
 */
router.put(
  "/:id",
  autenticarToken,
  authorizeRole("ADMIN"),
  validate(categorySchema),
  updateCategory
);


/* ======================================================================
   DELETE /categories/:id
   Remove uma categoria (apenas ADMIN)
   ====================================================================== */
/**
 * Importante:
 * - O Prisma lança erro P2025 se tentar deletar ID inexistente.
 * - Controller já trata essa exceção adequadamente.
 */
/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Remove uma categoria (ADMIN)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     description: Apenas administradores podem deletar categorias.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Categoria removida.
 *       404:
 *         description: Categoria não encontrada.
 */
router.delete(
  "/:id",
  autenticarToken,
  authorizeRole("ADMIN"),
  deleteCategory
);

export default router;
