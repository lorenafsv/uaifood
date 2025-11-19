import { z } from "zod";
import { messages } from "./messages.js";

// ======================================================================
// SCHEMA DE VALIDAÇÃO DO PEDIDO (Order)
// ----------------------------------------------------------------------
// Este schema garante que:
//   - forma de pagamento seja válida
//   - o pedido sempre tenha itens
//   - cada item tenha ID e quantidade válidos
//
// Ele protege o sistema de inconsistências que poderiam:
///  - quebrar cálculos de total
//   - criar pedidos vazios
//   - gerar pedidos com itens inexistentes
//   - impactar relatórios e painel do ADMIN
// ======================================================================

export const orderSchema = z.object({
  /**
   * paymentMethod
   * --------------------------------------------------------------
   * Enum rígido para evitar valores inesperados no banco.
   * Isso protege o backend e o dashboard do admin,
   * garantindo que apenas métodos reconhecidos sejam usados.
   *
   * O errorMap aqui sobrescreve a mensagem default do Zod.
   */
  paymentMethod: z.enum(["CASH", "DEBIT", "CREDIT", "PIX"], {
    errorMap: () => ({
      message: messages.invalidEnum("Método de pagamento", [
        "CASH",
        "DEBIT",
        "CREDIT",
        "PIX",
      ]),
    }),
  }),

  /**
   * items
   * --------------------------------------------------------------
   * Um pedido SEMPRE precisa ter itens.
   * Cada item contém:
   *  - itemId (número inteiro)
   *  - quantity (quantidade positiva)
   *
   * A validação evita:
   *  - pedidos vazios
   *  - produtos sem ID válido
   *  - quantidades inválidas (0, negativo, string etc.)
   */
  items: z
    .array(
      z.object({
        /**
         * ID do item — precisa ser um número inteiro.
         */
        itemId: z.number().int(messages.invalidId("ID do item")),

        /**
         * Quantidade — precisa ser maior que zero.
         */
        quantity: z.number().positive(messages.positiveQuantity),
      })
    )
    .nonempty(messages.mustContainItems), // impede pedidos vazios
});
