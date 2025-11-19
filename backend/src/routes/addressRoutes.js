import express from "express";
import {
  createMyAddress,
  getMyAddress,
  updateMyAddress,
  deleteMyAddress,
} from "../controllers/addressController.js";

import { autenticarToken } from "../middlewares/autenticarToken.js";
import { validate } from "../middlewares/validate.js";
import { addressSchema } from "../validation/addressSchema.js";

const router = express.Router();

/**
 * ROTAS DE ENDEREÇO
 *
 * Este módulo cuida exclusivamente do endereço do usuário autenticado.
 *
 * Decisões importantes:
 * - Cada usuário só pode ter **um** endereço (relacionamento 1:1)
 * - O userId nunca vem do body, é sempre extraído do token (segurança)
 * - Não existe rota "list all addresses" por questões de privacidade
 * - CRUD limitado ao próprio usuário autenticado
 *
 */


/**
 * @swagger
 * tags:
 *   - name: Endereços
 *     description: Gerenciamento de endereço do usuário autenticado
 */


/* ======================================================================
   GET /addresses/me
   Retorna o endereço do usuário autenticado
   ====================================================================== */
/**
 * @swagger
 * /addresses/me:
 *   get:
 *     summary: Retorna o endereço do usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Endereço encontrado.
 *         content:
 *           application/json:
 *             example:
 *               id: 10
 *               userId: 1
 *               street: "Rua das Flores"
 *               number: "123"
 *               district: "Centro"
 *               city: "Uberaba"
 *               state: "MG"
 *               zipCode: "38000-000"
 *       404:
 *         description: O usuário ainda não possui endereço cadastrado.
 */
router.get("/me", autenticarToken, getMyAddress);
// autenticarToken: garante que req.user.id está disponível


/* ======================================================================
   POST /addresses
   Cria o endereço do usuário autenticado
   ====================================================================== */
/**
 * Observações importantes:
 *  - Apenas cria se o usuário ainda não tiver endereço (lógica no controller)
 *  - Usa Zod para validar formato
 */
/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Cria um endereço para o usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - Só cria o endereço se o usuário **não possuir um já cadastrado**  
 *       - O ID do usuário é inferido automaticamente a partir do token  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             street: "Rua das Acácias"
 *             number: "456"
 *             district: "Jardim América"
 *             city: "Uberaba"
 *             state: "MG"
 *             zipCode: "38010-200"
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 11
 *               userId: 1
 *               street: "Rua das Acácias"
 *               number: "456"
 *               district: "Jardim América"
 *               city: "Uberaba"
 *               state: "MG"
 *               zipCode: "38010-200"
 *       400:
 *         description: Usuário já possui um endereço cadastrado.
 */
router.post("/", autenticarToken, validate(addressSchema), createMyAddress);


/* ======================================================================
   PUT /addresses
   Atualiza o endereço do usuário autenticado
   ====================================================================== */
/**
 * Detalhes importantes:
 *  - Atualiza somente o endereço do próprio usuário
 *  - Caso não exista endereço previamente retorna 404
 *  - Mesmo schema do POST, garantindo dados padronizados
 */
/**
 * @swagger
 * /addresses:
 *   put:
 *     summary: Atualiza o endereço do usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - Só é possível atualizar se o usuário já tiver um endereço cadastrado  
 *       - Atualiza qualquer campo enviado  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             street: "Rua Atualizada"
 *             number: "999"
 *             district: "Centro"
 *             city: "Uberaba"
 *             state: "MG"
 *             zipCode: "38010-010"
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 10
 *               userId: 1
 *               street: "Rua Atualizada"
 *               number: "999"
 *               district: "Centro"
 *               city: "Uberaba"
 *               state: "MG"
 *               zipCode: "38010-010"
 *       404:
 *         description: O usuário não possui endereço cadastrado.
 */
router.put("/", autenticarToken, validate(addressSchema), updateMyAddress);


/* ======================================================================
   DELETE /addresses
   Remove o endereço do usuário autenticado
   ====================================================================== */
/**
 * Notas:
 *  - Exclusão definitiva
 *  - Segurança garantida pelo middleware de autenticação
 */
/**
 * @swagger
 * /addresses:
 *   delete:
 *     summary: Remove o endereço do usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - Remove o endereço associado ao token do usuário  
 *     responses:
 *       200:
 *         description: Endereço removido com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               message: "Endereço removido com sucesso."
 *       404:
 *         description: O usuário não possui endereço cadastrado.
 */
router.delete("/", autenticarToken, deleteMyAddress);

export default router;
