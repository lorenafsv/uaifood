import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  // ======================================================================
  // ESTADO DO FORMULÁRIO
  // ======================================================================
  // - Campo "type" é fixo como CLIENT para impedir criação arbitrária de ADMIN
  // ======================================================================
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    type: "CLIENT",
  });

  // ======================================================================
  // ESTADOS DE FEEDBACK (SUCESSO / ERRO)
  // ======================================================================
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ======================================================================
  // ATUALIZA CAMPOS DO FORM CONFORME O USUÁRIO DIGITA
  // ======================================================================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================================================================
  // SUBMISSÃO DO CADASTRO
  // ======================================================================
  // ======================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await API.post("/users/register", form);
      setSuccessMsg("Conta criada com sucesso! Redirecionando...");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Erro ao criar conta. Verifique os dados."
      );
    }
  };

  // ======================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ======================================================================
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">

        {/* TÍTULO */}
        <h1 className="text-3xl font-bold text-center mb-6 text-red-600">
          Criar Conta 🍔
        </h1>

        {/* ERRO */}
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* SUCESSO */}
        {successMsg && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 font-medium text-center">
            {successMsg}
          </div>
        )}

        {/* ================================================================
           FORMULÁRIO DE CADASTRO
           ================================================================ */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome */}
          <div>
            <label className="block font-medium mb-1">Nome</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block font-medium mb-1">Telefone</label>
            <input
              type="text"
              name="phone"
              placeholder="(34) 99999-9999"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              placeholder="seuemail@exemplo.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block font-medium mb-1">Senha</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          {/* Botão */}
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white text-lg p-3 rounded-lg font-semibold transition"
          >
            Registrar
          </button>
        </form>

        {/* Link para login */}
        <p className="text-center mt-4 text-sm">
          Já tem conta?{" "}
          <Link className="text-red-600 font-semibold" to="/login">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
