import { z } from "zod";
import { messages } from "./messages.js";

/**
 * SCHEMA DE VALIDAÇÃO DA CATEGORIA
 *
 * Este schema garante que:
 * - A descrição da categoria tenha um tamanho mínimo aceitável
 * - Evitamos registros genéricos, vazios ou nomes inúteis no BD (ex.: "a", "x")
 *
 * As categorias são essenciais para organizar e filtrar os itens no front e no admin.
 * Por isso, manter um padrão mínimo de qualidade evita bagunça no catálogo
 * e inconsistências futuramente.
 *
 * Rotas que usam este schema:
 *   POST /categories      → criação (somente ADMIN)
 *   PUT  /categories/:id  → atualização (somente ADMIN)
 */
export const categorySchema = z.object({
  /**
   * Descrição da categoria.
   *
   * Regras:
   * - Deve ser uma string
   * - Deve ter pelo menos 3 caracteres
   *
   * Motivo:
   *   Categorias muito curtas ficam pouco descritivas e prejudicam o catálogo.
   *   Exemplos inválidos: "A", "X", "L".
   *
   * Exemplos válidos:
   *   - "Lanches"
   *   - "Bebidas"
   *   - "Sobremesas"
   */
  description: z
    .string()
    .min(3, messages.minLength("Descrição", 3)),
});
