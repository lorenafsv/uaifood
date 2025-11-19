import { createContext, useState, useEffect } from "react";
import API from "../api/api";

// ======================================================================
// CONTEXTO DE AUTENTICAÇÃO
// ======================================================================
// O AuthContext centraliza:
// - dados do usuário autenticado
// - estado de loading inicial
// - função de logout
// - função para atualizar o usuário
//
// Isso permite que qualquer componente do frontend acesse esses dados
// sem precisar repassar props manualmente.
//
export const AuthContext = createContext();

// ======================================================================
// PROVIDER: responsável por armazenar e fornecer os dados para a aplicação
// ======================================================================
export default function AuthProvider({ children }) {
  // "user" guarda os dados retornados do backend (nome, email, tipo, endereço…)
  const [user, setUser] = useState(null);

  // "loading" impede a aplicação de renderizar antes de confirmar se
  // o usuário está logado ou não (evita flashes na interface)
  const [loading, setLoading] = useState(true);

  // ====================================================================
  // FUNÇÃO DE LOGOUT
  // ====================================================================
  // Objetivo:
  // - invalidar o token no backend (blacklist)
  // - limpar o token localmente
  // - resetar o estado global do usuário
  //
  const logout = async () => {
    try {
      // Faz logout no backend (opcional para segurança)
      await API.post("/users/logout");
    } catch (err) {
      // Mesmo que o backend falhe, o frontend deve remover o token
      console.warn("Erro ao fazer logout no servidor:", err);
    }

    // Remove o token local para encerrar a sessão imediatamente
    localStorage.removeItem("authToken");

    // Reseta dados do usuário no contexto
    setUser(null);
  };

  // ====================================================================
  // CARREGA USUÁRIO AUTOMATICAMENTE COM BASE NO TOKEN
  // ====================================================================
  // Este useEffect é executado uma única vez ao iniciar o app.
  //
  // Fluxo:
  // 1. Verifica se existe token salvo
  // 2. Se existir, tenta buscar "/users/me"
  // 3. Se der certo → usuário está autenticado
  // 4. Se der erro → token expirou / inválido → remove token
  //
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // Caso não exista token, não tenta validar no backend
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Função que valida o token no backend
    const loadUser = async () => {
      try {
        const res = await API.get("/users/me");
        setUser(res.data); // backend retorna o usuário já completo
      } catch (err) {
        // Se o token expirou, foi invalidado ou está corrompido
        localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        // Libera a UI para renderizar
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ====================================================================
  // PROVEDOR DO CONTEXTO
  // ====================================================================
  // Aqui disponibilizamos para toda a aplicação:
  // - user: dados do usuário logado
  // - setUser: caso precise atualizar manualmente
  // - logout: função universal
  // - loading: bloqueia interface enquanto verifica autenticação
  //
  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
