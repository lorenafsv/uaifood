import { z } from "zod";
import { messages } from "./messages.js";

/**
 * SCHEMA DE VALIDAÇÃO DO ITEM
 *
 * Este schema garante que:
 *  - Cada item cadastrado tenha dados coerentes e completos
 *  - O catálogo não receba preços inválidos, descrições ruins ou categorias
 *    inexistentes
 *
 * Rotas que usam este schema:
 *   POST /items      → criação de item (ADMIN)
 *   PUT  /items/:id  → edição de item (ADMIN)
 *
 * Como os itens são exibidos diretamente para o cliente, validar bem
 * evita inconsistências no front e erros de cálculo nos pedidos.
 */
export const itemSchema = z.object({
  /**
   * Descrição do item.
   *
   * Regras:
   *  - Deve ser string.
   *  - Deve ter pelo menos 3 caracteres.
   *
   * Motivo:
   *  O nome do item aparece nos cards do cliente e do admin.
   *  Names curtos como “X”, “A”, “1” prejudicam UX e deixam o catálogo feio.
   *
   * Exemplos válidos:
   *  - "X-Salada"
   *  - "Coca-Cola 350ml"
   *  - "Batata Frita"
   */
  description: z.string().min(3, messages.minLength("Descrição", 3)),

  /**
   * Preço unitário.
   *
   * Regras:
   *  - Deve ser número.
   *  - Deve ser positivo (> 0).
   *
   * Motivo:
   *  Esse valor é usado no cálculo do total do pedido.
   *  Permitir zero ou valores negativos quebraria o fluxo financeiro.
   *
   * Exemplos:
   *  ✔ 18.90
   *  ✘ 0
   *  ✘ -10
   */
  unitPrice: z.number().positive(messages.invalidPrice),

  /**
   * URL da imagem do item.
   *
   * Regras:
   *  - Deve ser string com formato de URL (http/https).
   *  - É opcional (o admin pode cadastrar itens sem imagem no início).
   *
   * Motivo:
   *  O frontend exibe essas imagens em cards; validar evita links quebrados.
   */
  imageUrl: z.string().url(messages.invalidUrl).optional(),

  /**
   * ID da categoria a qual o item pertence.
   *
   * Regras:
   *  - Deve ser número inteiro.
   *  - Não pode ser string, null, ou decimal.
   *
   * Motivo:
   *  Evita cadastrar um item em uma categoria inexistente ou inválida.
   *
   * Observação:
   *  O Zod valida apenas o tipo — quem valida a existência da categoria
   *  é o Prisma (via constraint de chave estrangeira).
   */
  categoryId: z.number().int(messages.invalidId("ID da categoria")),
});
