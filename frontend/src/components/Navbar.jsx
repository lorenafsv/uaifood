import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

// ======================================================================
// COMPONENTE NAVBAR
// ======================================================================
// Objetivo:
// - Exibir um menu superior dinâmico baseado no tipo do usuário (ADMIN / CLIENT)
// - Mostrar ações específicas, como carrinho, pedidos, categorias etc.
// - Implementar o fluxo de logout limpando backend + frontend
// - Garantir navegação fluida com React Router
// ======================================================================

export default function Navbar() {
  // Recupera usuário autenticado e setter global
  const { user, setUser } = useContext(AuthContext);

  // Recupera carrinho global - usado para exibir o número de itens
  const { cart } = useContext(CartContext);

  const navigate = useNavigate();

  // --------------------------------------------------------------
  // FUNÇÃO DE LOGOUT
  // --------------------------------------------------------------
  // - Envia requisição ao backend para invalidar o token (blacklist)
  // - Garante limpeza local mesmo se backend falhar
  // - Redireciona para /login
  // --------------------------------------------------------------
  const handleLogout = async () => {
    try {
      await API.post("/users/logout");
    } catch (err) {
      console.warn("Erro ao deslogar:", err);
    }

    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login");
  };

  // --------------------------------------------------------------
  // RENDERIZAÇÃO DA NAVBAR
  // --------------------------------------------------------------
  return (
    <nav className="bg-red-500 text-white p-4 flex justify-between items-center">

      <Link to="/" className="text-xl font-bold">
        Uaifood 🍔
      </Link>

      <div className="flex gap-4 items-center">

        {/* ----------------------------------------------------------
           LINKS EXCLUSIVOS PARA ADMINISTRADORES
           ---------------------------------------------------------- */}
        {user?.type === "ADMIN" && (
          <>
            <Link to="/admin/categories">Categorias</Link>
            <Link to="/admin/items">Itens</Link>
            <Link to="/admin/orders">Pedidos</Link>
          </>
        )}

        {/* ----------------------------------------------------------
           LINKS EXCLUSIVOS PARA CLIENTES
           ---------------------------------------------------------- */}
        {user?.type === "CLIENT" && (
          <>
            <Link to="/orders">Meus Pedidos</Link>
            <Link to="/cart">Carrinho ({cart.length})</Link>
          </>
        )}

        {/* ----------------------------------------------------------
           LINKS PARA QUALQUER USUÁRIO AUTENTICADO
           ---------------------------------------------------------- */}
        {user && (
          <>
            <Link to="/profile">Perfil</Link>

            <button
              onClick={handleLogout}
              className="bg-white text-red-600 px-3 py-1 rounded-lg font-semibold hover:bg-red-100 transition"
            >
              Sair
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
