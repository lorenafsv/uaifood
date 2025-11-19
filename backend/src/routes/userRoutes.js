import express from "express";
import {
  createUser,
  login,
  logout,
  getUsers,
  updateUser,
  getMe,
} from "../controllers/userController.js";
import { autenticarToken } from "../middlewares/autenticarToken.js";

import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validate } from "../middlewares/validate.js";
import { userSchema } from "../validation/userSchema.js";
import { updateUserSchema } from "../validation/updateUserSchema.js";

const router = express.Router();

/**
 * ROTAS DE USUÁRIO E AUTENTICAÇÃO
 *
 * Este módulo concentra tudo que envolve:
 * - Criação de usuário (signup)
 * - Login (gera token JWT)
 * - Logout (coloca token na blacklist)
 * - Consultar perfil próprio
 * - Atualizar dados
 * - Listar usuários (somente ADMIN)
 *
 * 🧠 Decisões importantes deste módulo:
 *
 * 1) CLIENT só pode alterar o próprio usuário.
 *    → Validado tanto no middleware quanto no controller.
 *
 * 2) ADMIN pode alterar **qualquer usuário**, inclusive seu próprio.
 *
 * 3) O token JWT sempre carrega: { id, type }
 *    → O backend nunca confia em dados enviados pelo front para identificar usuário.
 *
 * 4) Todas as operações sensíveis exigem autenticação.
 *
 * 5) Schemas Zod garantem a sanidade dos dados:
 *    - `userSchema`: criação
 *    - `updateUserSchema`: atualização
 *
 * 6) O Swagger foi organizado em dois grupos:
 *    - Autenticação
 *    - Usuários
 */

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Rotas relacionadas a login e controle de sessão
 *   - name: Usuários
 *     description: Gerenciamento de usuários (ADMIN e CLIENT)
 */


/* ======================================================================
   POST /users/register
   Cria um novo usuário (CLIENT por padrão)
   ====================================================================== */
/**
 * Motivos:
 * - Não exige token (rota pública)
 * - Validação forte via Zod (userSchema)
 * - O tipo do usuário é ALWAYS "CLIENT"
 *   → Previndo que alguém tente registrar já como ADMIN
 */
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post("/register", validate(userSchema), createUser);


/* ======================================================================
   POST /users/login
   Login e geração de token JWT
   ====================================================================== */
/**
 * Aqui não usamos validate() porque o login tem regras diferentes.
 * A validação é feita manualmente dentro do controller.
 */
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Realiza login e retorna o token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", login);


/* ======================================================================
   POST /users/logout
   Invalida o token atual (adiciona à blacklist)
   ====================================================================== */
/**
 * É obrigatório estar autenticado:
 * - Sem token → 401
 * - Com token inválido/expirado → 403
 *
 * O token é levado para a blacklist, evitando reuso.
 */
/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Realiza logout e invalida o token atual
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado
 *       401:
 *         description: Token não fornecido
 */
router.post("/logout", autenticarToken, logout);


/* ======================================================================
   GET /users/me
   Retorna os dados do usuário autenticado
   ====================================================================== */
/**
 * Usa os dados do token (id, type) para buscar o usuário.
 * Não aceita parâmetros externos → evita spoofing.
 */
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Token inválido
 */
router.get("/me", autenticarToken, getMe);


/* ======================================================================
   GET /users
   ADMIN lista todos os usuários cadastrados
   ====================================================================== */
/**
 * CLIENT não pode listar usuários, pois seria um vazamento de dados sensíveis.
 * ADMIN tem acesso total.
 */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários cadastrados (somente ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 *       403:
 *         description: Acesso negado para CLIENT
 */
router.get("/", autenticarToken, authorizeRole("ADMIN"), getUsers);


/* ======================================================================
   PUT /users/:id
   Atualiza um usuário existente
   ====================================================================== */
/**
 * Regras importantes:
 *
 * - ADMIN pode atualizar QUALQUER usuário
 * - CLIENT pode atualizar APENAS ELE MESMO
 *   → Isso é verificado automaticamente no controller (segurança dupla)
 *
 * Equilíbrio entre frontend simples e backend seguro.
 *
 * Validação:
 * - Usamos updateUserSchema (não exige senha, mas aceita)
 *
 * Segurança:
 * - Sempre exige token
 * - ❗ Não depende de dados vindos do body para identificar o usuário
 *   → Sempre compara req.user.id com o :id
 */
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     description: 
 *       ADMIN pode atualizar qualquer usuário.  
 *       CLIENT só pode atualizar o próprio.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Permissão insuficiente
 *       404:
 *         description: Usuário não encontrado
 */
router.put(
  "/:id",
  autenticarToken,
  authorizeRole("ADMIN", "CLIENT"),
  validate(updateUserSchema),
  updateUser
);

export default router;
