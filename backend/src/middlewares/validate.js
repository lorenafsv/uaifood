import { ZodError } from "zod";

/**
 * Middleware de validação usando Zod.
 *
 * OBJETIVO:
 * - Validar o corpo da requisição (req.body) antes que ele chegue ao controller.
 * - Garantir que apenas dados corretos e saneados sejam processados.
 *
 * BENEFÍCIOS:
 * - Evita lógica de validação duplicada em cada rota.
 * - Zod já transforma tipos quando configurado no schema.
 * - Mantém os controllers focados apenas na regra de negócio.
 *
 * COMO FUNCIONA:
 * - Recebe um schema Zod como parâmetro.
 * - Se os dados forem válidos, substitui req.body pela versão parseada (normalizada).
 * - Se houver erro de validação, retorna 400 automaticamente.
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Faz o parse e validação de req.body.
      // - Se os dados estiverem corretos, Zod retorna uma versão normalizada.
      // - Se estiverem incorretos, lança ZodError.
      req.body = schema.parse(req.body);

      // Segue para o controller
      next();

    } catch (error) {

      // Se for um erro de validação do Zod, retornamos mensagem clara para o cliente.
      if (error instanceof ZodError) {
        return res.status(400).json({
          // Pega a primeira mensagem de erro da lista
          error: error.issues?.[0]?.message || "Erro de validação nos dados.",
        });
      }

      // Para qualquer outro tipo de falha, retornamos erro genérico de validação.
      return res.status(400).json({
        error: "Erro ao processar dados enviados.",
      });
    }
  };
};
