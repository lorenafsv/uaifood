import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // ======================================================================
  // ESTADO DO FORMULÁRIO
  // ======================================================================
  // - Mantém os dados editáveis pelo usuário
  // - Campo password inicia vazio para evitar exibir conteúdo sensível
  // ======================================================================
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  // ======================================================================
  // ESTADOS DE CONTROLE E FEEDBACK
  // ======================================================================
  const [loading, setLoading] = useState(true);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setMsgError] = useState("");

  // ======================================================================
  // CARREGAMENTO INICIAL DO PERFIL
  // ======================================================================
  // - Busca dados reais do usuário autenticado (/users/me)
  // - Preenche o formulário com as informações retornadas
  // - Atualiza também o contexto global
  // ======================================================================
  useEffect(() => {
    API.get("/users/me")
      .then((res) => {
        setForm({
          name: res.data.name,
          phone: res.data.phone,
          email: res.data.email,
          password: "",
        });
        setUser(res.data);
      })
      .catch(() => setMsgError("Não foi possível carregar seus dados."))
      .finally(() => setLoading(false));
  }, []);

  // ======================================================================
  // FUNÇÃO DE ATUALIZAÇÃO DE CAMPOS DO FORM
  // ======================================================================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================================================================
  // SALVAR ALTERAÇÕES DO PERFIL
  // ======================================================================
  // - Remove campo password caso esteja vazio para evitar sobrescrever senha
  // - Após alterar, atualiza o contexto e exibe mensagem de sucesso
  // ======================================================================
  const handleSave = async (e) => {
    e.preventDefault();
    setMsgSuccess("");
    setMsgError("");

    try {
      const payload = { ...form };
      if (payload.password === "") delete payload.password;

      const res = await API.put(`/users/${user.id}`, payload);

      setMsgSuccess("Dados atualizados com sucesso!");
      setUser(res.data); // mantém estado global sincronizado
    } catch (err) {
      setMsgError(err.response?.data?.error || "Erro ao atualizar dados.");
    }
  };

  // ======================================================================
  // ESTADO: CARREGANDO
  // ======================================================================
  if (loading) {
    return <div className="p-6 text-center text-lg">Carregando perfil...</div>;
  }

  // ======================================================================
  // RENDERIZAÇÃO DO PERFIL
  // ======================================================================
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-red-600">Meu Perfil 👤</h1>

      {/* FEEDBACK DE SUCESSO */}
      {msgSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg font-medium">
          {msgSuccess}
        </div>
      )}

      {/* FEEDBACK DE ERRO */}
      {msgError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg font-medium">
          {msgError}
        </div>
      )}

      {/* ================================================================
         FORMULÁRIO DE ATUALIZAÇÃO DE PERFIL
         ================================================================ */}
      <form
        onSubmit={handleSave}
        className="space-y-4 bg-white p-6 shadow rounded-xl"
      >
        {/* Nome */}
        <div>
          <label className="font-medium block mb-1">Nome</label>
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
          <label className="font-medium block mb-1">Telefone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="font-medium block mb-1">E-mail</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
            required
          />
        </div>

        {/* Senha */}
        <div>
          <label className="font-medium block mb-1">Nova senha (opcional)</label>
          <input
            type="password"
            name="password"
            placeholder="Deixe vazio para não alterar"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-400"
          />
        </div>

        <button className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold">
          Salvar alterações
        </button>
      </form>

      {/* ================================================================
         BLOCO DE ENDEREÇO
         ================================================================ */}
      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold text-red-600">Endereço</h2>

        {user.address ? (
          <p className="text-gray-600">Endereço cadastrado.</p>
        ) : (
          <p className="text-gray-600">Nenhum endereço cadastrado.</p>
        )}

        <button
          type="button"
          onClick={() => navigate("/address")}
          className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold mt-3"
        >
          {user.address ? "Editar endereço" : "Adicionar endereço"}
        </button>
      </div>
    </div>
  );
}
