/**
 * Middleware de AUTORIZAÇÃO baseado em papéis (roles).
 *
 * OBJETIVO:
 * - Garantir que apenas usuários com determinados perfis (ADMIN, CLIENT)
 *   possam acessar rotas específicas.
 *
 * COMO FUNCIONA:
 * - Primeiro, o middleware de autenticação (autenticarToken) injeta `req.user`
 *   com o usuário decodificado do JWT.
 * - Aqui, verificamos se o tipo desse usuário (`req.user.type`)
 *   está entre os permitidos para a rota.
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {

    // Extraímos o tipo de usuário presente no token.
    const userType = req.user?.type;

    // Se o middleware anterior não populou `req.user`,
    // ou se o token não contém o tipo, negar por segurança.
    if (!userType) {
      return res.status(403).json({
        message: "Tipo de usuário não identificado no token.",
      });
    }

    // Verificamos se o tipo do usuário está dentro da lista de roles permitidos.
    // Caso contrário, é tentativa de acesso indevido.
    if (!allowedRoles.includes(userType)) {
      return res.status(403).json({
        message: "Acesso negado: permissão insuficiente.",
      });
    }

    // Se passou por todas as validações, prossgue para o controller.
    next();
  };
};
