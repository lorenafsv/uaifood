import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ======================================================================
// COMPONENTE DE ROTA PROTEGIDA
// ======================================================================
// Objetivo:
// - Bloquear acesso a rotas que exigem autenticação
// - Restringir por tipo de usuário (CLIENT / ADMIN)
//
// Funcionamento:
// 1. Verifica se ainda está carregando informações do usuário
// 2. Se não estiver logado redireciona para /login
// 3. Valida permissão
// 4. Caso esteja tudo OK renderiza o conteúdo
//
export default function ProtectedRoute({ children, allowed }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p className="p-4 text-center">Carregando...</p>;

  // --------------------------------------------------------------------
  // Se não houver usuário logado bloqueia acesso.
  // --------------------------------------------------------------------
  if (!user) return <Navigate to="/login" />;

  // --------------------------------------------------------------------
  // Caso a rota exija permissões específicas (ADMIN / CLIENT)
  // --------------------------------------------------------------------
  if (allowed && !allowed.includes(user.type)) {
    // Segurança: usuário autenticado, mas sem permissão
    return <Navigate to="/" />;
  }

  // --------------------------------------------------------------------
  // Se tudo certo libera a rota
  // --------------------------------------------------------------------
  return children;
}
