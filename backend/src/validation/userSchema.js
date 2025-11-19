import { z } from "zod";
import { messages } from "./messages.js";

/**
 * ======================================================================
 *  SCHEMA DE CADASTRO DE USUÁRIO (User Create)
 * ----------------------------------------------------------------------
 * Este schema é usado exclusivamente durante o REGISTRO de um usuário,
 * ou seja: POST /users/register.
 *
 * Como é o ponto de entrada do sistema, é essencial que TODOS os campos
 * sejam validados com rigor:
 *  - Nome mínimo para evitar registros descartáveis
 *  - Telefone em formato válido (importante para contato e entregas)
 *  - E-mail válido para login
 *  - Senha robusta o suficiente
 *
 * Esse schema impede que dados ruins entrem no banco e prejudiquem
 * autenticação, navegação ou fluxo de pedidos posteriormente.
 * ======================================================================
 */

export const userSchema = z.object({

  /**
   * name
   * --------------------------------------------------------------
   * Nome completo do usuário.
   * Exigimos pelo menos 3 caracteres para evitar:
   *  - nomes inválidos (ex.: "A", "Jo", "Xx")
   *  - perfis spam
   */
  name: z.string().min(3, messages.minLength("Nome", 3)),

  /**
   * phone
   * --------------------------------------------------------------
   * Validação flexível, mas segura, permitindo:
   *  - (34) 99999-9999
   *  - 34999999999
   *  - 34 99999-9999
   *  - etc.
   *
   * O telefone é obrigatório no cadastro para permitir:
   *  - contatos da entrega
   *  - informações pós-pedido
   */
  phone: z
    .string()
    .regex(/^\(?\d{2}\)? ?9?\d{4}-?\d{4}$/, messages.invalidPhone),

  /**
   * email
   * --------------------------------------------------------------
   * O Zod já valida estrutura completa de email.
   * Essa validação impede problemas no login futuramente.
   */
  email: z.string().email(messages.invalidEmail),

  /**
   * password
   * --------------------------------------------------------------
   * Senha obrigatória e com mínimo de 6 caracteres.
   *
   * Importância:
   *  - reduz risco de login frágil
   *  - impede usuários com senha vazia ou fraca demais
   *
   * Exemplos válidos:
   *   "abc123"
   *   "minhasenha123"
   */
  password: z.string().min(6, messages.invalidPassword),
});
