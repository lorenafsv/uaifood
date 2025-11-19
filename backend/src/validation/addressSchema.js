import { z } from "zod";
import { messages } from "./messages.js";

/**
 * SCHEMA DE VALIDAÇÃO DO ENDEREÇO
 *
 * Este schema Zod garante que:
 * - O payload enviado pelo usuário está completo
 * - Todos os campos seguem um padrão mínimo de qualidade
 * - Evitamos dados incompletos/imprecisos no BD (ex.: "rua a", número vazio…)
 *
 * 💡 Observação importante:
 * O endereço do usuário sempre vem de:
 *   POST /addresses   → cria o endereço
 *   PUT /addresses    → atualiza o endereço
 *
 * Esse schema garante que **todos os campos necessários** sejam enviados,
 * tanto na criação quanto na atualização.
 *
 * Regras principais:
 * - Campos textuais devem ter tamanho mínimo
 * - Estado deve ser SEMPRE UF de 2 letras
 * - CEP deve ser numérico e com 8 dígitos (ex.: 38000222)
 *   → O front pode formatar, mas o backend não armazena traço
 */

export const addressSchema = z.object({
  /**
   * Nome da rua
   * Exige pelo menos 3 caracteres para evitar valores inválidos.
   */
  street: z
    .string()
    .min(3, messages.minLength("Rua", 3)),

  /**
   * Número do endereço — tratado como string.
   *
   * ❗ Por que string e não number?
   *   - Endereços podem ter complemento no número:
   *       "200A", "S/N", "101-Bloco B"
   *   - Evita erros de parse e necessidade de union()
   *
   * Exigimos min(1) para impedir número vazio.
   */
  number: z
    .string()
    .min(1, messages.minLength("Número", 1)),

  /**
   * Bairro do endereço
   * Segue padrão mínimo de 3 caracteres.
   */
  district: z
    .string()
    .min(3, messages.minLength("Bairro", 3)),

  /**
   * Cidade — 2+ caracteres
   */
  city: z
    .string()
    .min(2, messages.minLength("Cidade", 2)),

  /**
   * UF do estado
   * Obrigatoriamente 2 letras (ex.: "MG", "SP", "RJ")
   */
  state: z
    .string()
    .length(2, "O estado deve ter exatamente 2 letras."),

  /**
   * CEP validado com REGEX:
   * - Apenas números
   * - Exatamente 8 dígitos
   *
   * Nesse formato: "38000222"
   * O tratamento visual (38000-222) pode ser feito no front.
   */
  zipCode: z
    .string()
    .regex(/^\d{8}$/, messages.invalidCEP),
});
