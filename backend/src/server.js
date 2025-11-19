import app from "./app.js";

/**
 * ======================================================================
 * CONFIGURAÇÃO DA PORTA DE EXECUÇÃO
 * ======================================================================
 *
 * process.env.PORT:
 *   - Permite que serviços externo definam a porta automaticamente.
 *
 * 5001:
 *   - Porta padrão local para desenvolvimento.
 */
const PORT = process.env.PORT || 5001;


/**
 * ======================================================================
 * INICIALIZAÇÃO DO SERVIDOR HTTP
 * ======================================================================
 *
 * app.listen():
 *   - Sobe o servidor Express previamente configurado em app.js
 */
app.listen(PORT, () => {
  console.log(`Swagger disponível em: http://localhost:${PORT}/api-docs`);
  console.log(`Uaifood API rodando na porta ${PORT}`);
});
