import jwt from "jsonwebtoken";

// ===================================================================
// LISTA DE BLACKLIST PARA TOKENS INVALIDADOS
// ===================================================================
/**
 * Aqui usamos um array simples para bloquear tokens expirados via logout.
 *
 * 🎯 Pontos importantes:
 * - Em aplicações reais de produção, isso deveria ser armazenado em
 *   Redis ou outro storage rápido, pois:
 *     • escalabilidade → múltiplas instâncias precisam compartilhar blacklist
 *     • limpeza automática após expiração
 * - Para desenvolvimento/local, essa implementação é suficiente.
 */
const blacklist = [];

// ===================================================================
// GERAR TOKEN JWT
// ===================================================================
export const generateToken = (user) => {
  /**
   * O JWT é assinado contendo:
   * - id: identifica o usuário na API
   * - type: usado nas regras de autorização (CLIENT / ADMIN)
   *
   * 🚨 Importante:
   * Nunca incluir dados sensíveis (senha, email, telefone) no token.
   */
  return jwt.sign(
    { id: user.id, type: user.type },
    process.env.SECRET_JWT, // chave privada usada para assinar o token
    {
      // Expiração configurável: evita tokens eternos
      expiresIn: process.env.TOKEN_EXPIRATION || "1h",
    }
  );
};

// ===================================================================
// INVALIDAR TOKEN (LOGOUT)
// ===================================================================
export const blacklistToken = (token) => {
  /**
   * Ao fazer logout, adicionamos o token na blacklist.
   * Qualquer tentativa futura de uso será rejeitada pelo verifyToken().
   *
   * ➕ Boa prática:
   * Poderíamos guardar também o timestamp de expiração para limpeza automática.
   */
  blacklist.push(token);
};

// ===================================================================
// VERIFICAR TOKEN
// ===================================================================
export const verifyToken = (token) => {
  /**
   * 1️⃣ Se o token estiver na blacklist → é inválido
   * Usuário fez logout ou token comprometido.
   */
  if (blacklist.includes(token)) {
    throw new Error("Token inválido (blacklist).");
  }

  /**
   * 2️⃣ Se o token NÃO estiver na blacklist:
   * Verifica se:
   * - assinatura é válida
   * - expirou
   * - está íntegro
   */
  return jwt.verify(token, process.env.SECRET_JWT);
};
