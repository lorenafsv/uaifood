// ======================================================================
// MENSAGENS PADRONIZADAS PARA VALIDAÇÃO ZOD
// ----------------------------------------------------------------------
// Este arquivo centraliza todas as mensagens de erro usadas nos schemas,
// garantindo consistência e evitando duplicação.
//
// Benefícios:
//  - Facilita manutenção (alterou aqui → muda em todos os schemas)
//  - Garante padrão de linguagem nos erros da API
//  - Ajuda o front a exibir mensagens previsíveis
// ======================================================================

export const messages = {
  /**
   * Campos obrigatórios.
   * Usado quando um valor é "undefined" ou vazio.
   *
   * Exemplos:
   *  - Nome é obrigatório.
   *  - CEP é obrigatório.
   */
  required: (field) => `${field} é obrigatório.`,

  /**
   * Campos com comprimento mínimo.
   * Evita descrições muito curtas e textos ruins (ex: "A", "X", "1").
   */
  minLength: (field, n) => `${field} deve ter pelo menos ${n} caracteres.`,

  /**
   * E-mail inválido.
   * Usado em userSchema e updateUserSchema.
   */
  invalidEmail: "E-mail inválido.",

  /**
   * Telefone em formato inconsistente.
   * Ajuda a manter um padrão no app (útil especialmente para delivery).
   */
  invalidPhone: "Telefone deve estar no formato (XX) 9XXXX-XXXX.",

  /**
   * Senha muito fraca.
   * Evita cadastro com senhas curtas.
   */
  invalidPassword: "A senha deve conter pelo menos 6 caracteres.",

  /**
   * Preço inválido em itens.
   * Evita valores negativos ou zero (impactaria o cálculo de pedidos).
   */
  invalidPrice: "O preço deve ser um número positivo.",

  /**
   * Validação de enums, útil quando existem opções fixas.
   * Exemplo: método de pagamento, tipo de usuário, status.
   */
  invalidEnum: (field, values) =>
    `${field} deve ser um dos seguintes: ${values.join(", ")}.`,

  /**
   * Quantidades inválidas.
   * Evita itens de pedido com quantidade zero ou negativa.
   */
  positiveQuantity: "A quantidade deve ser maior que zero.",

  /**
   * URLs inválidas (imagens dos itens).
   * Ajuda a prevenir imagens quebradas no frontend.
   */
  invalidUrl: "A URL fornecida é inválida.",

  /**
   * IDs inválidos.
   * Evita IDs como "abc", null, undefined ou decimais.
   */
  invalidId: (field) => `${field} deve ser um número inteiro válido.`,

  /**
   * Itens obrigatórios no pedido.
   * Impede pedidos vazios.
   */
  mustContainItems: "O pedido deve conter pelo menos um item.",

  /**
   * CEP inválido (sem hífen).
   * Ex.: 38000000 é válido → formato brasileiro sem máscara.
   */
  invalidCEP: "CEP inválido.",
};
