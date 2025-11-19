import { z } from "zod";
import { messages } from "./messages.js";

// ======================================================================
// SCHEMA DE ATUALIZAÇÃO DE USUÁRIO (User Update)
// ----------------------------------------------------------------------
// Este schema garante que, ao atualizar os dados do usuário, ele nunca
// envie informações quebradas ou inválidas.
// 
// Ele protege contra problemas comuns:
//   - e-mails mal formatados (quebram login)
//   - telefones inválidos (quebram cadastro/entrega)
//   - nome muito curto
//   - senha vazia ou fraca
//
// OBS: Esse schema é utilizado tanto por CLIENT quanto por ADMIN,
// então ele deve ser seguro e flexível.
// ======================================================================

export const updateUserSchema = z.object({

  /**
   * name
   * ------------------------------------------------------------------
   * Nome do usuário.
   * Mantemos mínimo de 3 letras para evitar nomes inválidos
   * como "A", "Jo", "X".
   */
  name: z.string().min(3, messages.minLength("Nome", 3)),

  /**
   * phone
   * ------------------------------------------------------------------
   * Telefone em formato flexível:
   *  - (34) 99999-9999
   *  - 34999999999
   *  - 34 99999-9999
   *  - etc.
   *
   * O regex foi pensado para ser tolerante, mas garantir estrutura válida.
   */
  phone: z
    .string()
    .regex(/^\(?\d{2}\)? ?9?\d{4}-?\d{4}$/, messages.invalidPhone),

  /**
   * email
   * ------------------------------------------------------------------
   * E-mail válido — o Zod já tem um validador robusto.
   * Isso impede:
   *  - emails sem "@" 
   *  - emails mal formatados
   */
  email: z.string().email(messages.invalidEmail),

  /**
   * password (opcional)
   * ------------------------------------------------------------------
   * Como o usuário pode atualizar os dados sem trocar senha,
   * deixamos como OPTIONAL.
   * 
   * Caso seja enviado:
   *  - precisa ter pelo menos 6 caracteres.
   *
   * Isso evita:
   *  - senhas em branco
   *  - senhas fracas demais
   */
  password: z
    .string()
    .min(6, messages.invalidPassword)
    .optional(),
});
