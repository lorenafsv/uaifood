import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {

  // =====================================================================
  // CONTEXTOS E NAVEGAÇÃO
  // =====================================================================
  // - Recupera setUser do AuthContext para armazenar sessão global
  // - useNavigate permite redirecionamento após login
  // =====================================================================
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // =====================================================================
  // ESTADOS DO COMPONENTE
  // =====================================================================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // =====================================================================
  // FUNÇÃO DE LOGIN
  // =====================================================================
  //
  // Fluxo:
  // 1. Cancela reload do form
  // 2. Envia requisição ao backend (/users/login)
  // 3. Salva token no localStorage para persistência da sessão
  // 4. Atualiza contexto global com os dados do usuário
  // 5. Redireciona automaticamente para a Home
  // =====================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await API.post("/users/login", {
        email,
        password,
      });

      // Token persistido usado no interceptor do axios
      localStorage.setItem("authToken", res.data.token);

      // Atualiza usuário global (nome, id, type)
      setUser(res.data.user);

      // Redireciona
      navigate("/");
    } catch (err) {
      setErrorMsg("E-mail ou senha incorretos.");
    }
  };

  // =====================================================================
  // RENDERIZAÇÃO
  // =====================================================================
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">

        {/* Logo + título */}
        <h1 className="text-3xl font-bold text-center mb-6 text-red-600">
          Uaifood 🍔
        </h1>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Campo: E-mail */}
          <div>
            <label className="block font-medium mb-1">E-mail</label>
            <input
              type="email"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo: Senha */}
          <div>
            <label className="block font-medium mb-1">Senha</label>
            <input
              type="password"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Botão de envio */}
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white text-lg p-3 rounded-lg font-semibold transition"
          >
            Entrar
          </button>
        </form>

        {/* Link para registro */}
        <p className="text-center mt-4 text-sm">
          Não tem uma conta?{" "}
          <Link className="text-red-600 font-semibold" to="/register">
            Registrar
          </Link>
        </p>

      </div>
    </div>
  );
}
