import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ======================================================================
// COMPONENTE DE ROTA PROTEGIDA
// ======================================================================
// Objetivo:
// - Bloquear acesso a rotas que exigem autenticação
// - Opcionalmente restringir por tipo de usuário (CLIENT / ADMIN)
// - Evitar flicker enquanto a sessão está carregando
//
// Funcionamento:
// 1. Verifica se ainda está carregando informações do usuário
// 2. Se não estiver logado → redireciona para /login
// 3. Se existir restrição de tipos (allowed) → valida permissão
// 4. Caso esteja tudo OK → renderiza o conteúdo (children)
//
export default function ProtectedRoute({ children, allowed }) {
  const { user, loading } = useContext(AuthContext);

  // --------------------------------------------------------------------
  // 1️⃣ Evita que a página pisque antes do estado de autenticação carregar.
  // --------------------------------------------------------------------
  if (loading) return <p className="p-4 text-center">Carregando...</p>;

  // --------------------------------------------------------------------
  // 2️⃣ Se não houver usuário logado → bloqueia acesso.
  // --------------------------------------------------------------------
  if (!user) return <Navigate to="/login" />;

  // --------------------------------------------------------------------
  // 3️⃣ Caso a rota exija permissões específicas (ADMIN / CLIENT)
  // --------------------------------------------------------------------
  // allowed é um array opcional, exemplo:
  // <ProtectedRoute allowed={['ADMIN']}>...</ProtectedRoute>
  //
  if (allowed && !allowed.includes(user.type)) {
    // Segurança: usuário autenticado, mas sem permissão
    return <Navigate to="/" />;
  }

  // --------------------------------------------------------------------
  // 4️⃣ Tudo certo → libera a rota
  // --------------------------------------------------------------------
  return children;
}
