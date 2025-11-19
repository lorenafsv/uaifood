import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

/**
 * ======================================================================
 * CONFIGURAÇÃO PRINCIPAL DO SWAGGER
 * ======================================================================
 *
 * O swagger-jsdoc lê comentários JSDoc nas rotas e gera automaticamente
 * a especificação OpenAPI 3.0.
 *
 * O swagger-ui-express exibe essa especificação como documentação interativa.
 */
const options = {
  /**
   * Estrutura base da documentação OpenAPI.
   * ----------------------------------------------------------------------
   */
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Uaifood API",
      version: "1.0.0",
      description: `
        API oficial do Uaifood para gerenciamento de usuários, itens, categorias, pedidos e endereços.
        Autenticação via JWT: Bearer <token>

        Perfis disponíveis:
        - CLIENT
        - ADMIN
        `,
    },

    /**
     * Servidores configurados.
     */
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`,
        description: "Servidor Local",
      },
    ],

    /**
     * securitySchemes → define como o Swagger injeta o token JWT
     * security        → aplica esse esquema globalmente
     */
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",        
          scheme: "bearer",    // envia header Authorization: Bearer xxx
          bearerFormat: "JWT", 
        },
      },
    },

    // Habilita autenticação JWT em TODAS as rotas por padrão
    security: [{ bearerAuth: [] }],
  },

  /**
   * Arquivos onde o swagger-jsdoc deve procurar comentários @swagger.
   */
  apis: ["./src/routes/*.js"],
};


/**
 * swaggerSpec é utilizado pelo swagger-ui-express para montar a UI.
 */
export const swaggerSpec = swaggerJSDoc(options);


/**
 * ======================================================================
 * Função responsável por registrar o Swagger no Express
 * ======================================================================
 *
 * swaggerDocs(app):
 *   - Cria a rota /api-docs
 *   - Exibe o Swagger UI
 *   - Torna a API explorável e testável pelo navegador
 */
export const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
