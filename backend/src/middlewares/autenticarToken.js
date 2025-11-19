import { verifyToken } from "../config/jwtConfig.js";

/**
 * Middleware responsável por autenticar requisições via JWT.
 *
 * PRINCIPAIS RESPONSABILIDADES:
 * - Garantir que a requisição contenha um token válido no header Authorization
 * - Extrair e validar o token JWT
 * - Popular `req.user` com os dados decodificados (id, email, role, etc.)
 * - Impedir que rotas protegidas sejam acessadas sem autenticação
 *
 * Esse middleware é executado antes do middleware de autorização
 * (authorizeRole), pois ele define `req.user`.
 */
export const autenticarToken = (req, res, next) => {
  try {
    // Extraímos o header Authorization, onde esperamos algo como:
    // Authorization: Bearer <token>
    const authHeader = req.headers["authorization"];

    // Valida se o header segue o padrão "Bearer <token>"
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1] // obter apenas o token
        : null;

    // Se não houver token, a requisição não pode prosseguir
    if (!token) {
      return res.status(401).json({ message: "Token não fornecido." });
    }

    // Verifica a assinatura e validade do token.
    // Se estiver expirado ou malformado, cairá no catch.
    const decoded = verifyToken(token);

    // Disponibilizamos os dados do usuário autenticado para
    // as próximas camadas (controllers)
    req.user = decoded;

    // Prossegue para o próximo middleware
    next();

  } catch {
    // Qualquer falha na verificação do token é tratada como acesso proibido.
    return res
      .status(403)
      .json({ message: "Token inválido, expirado ou não autorizado." });
  }
};
