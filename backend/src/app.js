import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { swaggerDocs } from "./swagger.js";

const app = express();

/**
 * ======================================================================
 *  CONFIGURAÇÃO GLOBAL DO APP
 * ======================================================================
 */

/**
 * Habilita o CORS para permitir que o frontend (React) acesse a API.
 */
app.use(cors());

/**
 * Permite que o Express entenda JSON no corpo das requisições.
 */
app.use(express.json());



/**
 * ======================================================================
 *  REGISTRO DAS ROTAS PRINCIPAIS
 * ======================================================================
 *
 * Encaminhamento do tráfego:
 *  - /users       Rotas de autenticação e usuários
 *  - /addresses   CRUD do endereço do cliente
 *  - /items       CRUD de itens do cardápio
 *  - /categories  CRUD de categorias
 *  - /orders      Fluxo de pedidos
 */
app.use("/users", userRoutes);
app.use("/addresses", addressRoutes);
app.use("/items", itemRoutes);
app.use("/categories", categoryRoutes);
app.use("/orders", orderRoutes);



/**
 * ======================================================================
 *  SWAGGER — DOCUMENTAÇÃO DA API
 * ======================================================================
 *
 * Função responsável por:
 *   - Configurar a rota: /api-docs
 *   - Carregar todos os comentários @swagger do projeto
 *   - Gerar e expor as documentações
 */
swaggerDocs(app);



/**
 * Exporta o app configurado
 * ----------------------------------------------------------
 * Quem sobe o servidor é o server.js.
 * Aqui mantemos apenas a configuração.
 */
export default app;
