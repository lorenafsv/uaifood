import { useEffect, useState, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

// ======================================================================
// COMPONENTE Address
// ======================================================================
// Responsável por:
// - Carregar endereço existente do usuário
// - Permitir cadastrar ou atualizar endereço
// - Validar entrada por meio do backend (Zod no servidor)
// - Sincronizar dados atualizados com o AuthContext (mantém coerência global)
//
// Regras importantes:
// - Usuário só pode ter *um* endereço (model: Address userId UNIQUE)
// - Se address.id existir → estamos atualizando
// - Se address.id NÃO existir → estamos criando
// ======================================================================

export default function Address() {
  const { user, setUser } = useContext(AuthContext);

  // Estado do endereço
  const [address, setAddress] = useState({
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Controle de carregamento e mensagens
  const [loading, setLoading] = useState(true);
  const [msgError, setMsgError] = useState("");
  const [msgSuccess, setMsgSuccess] = useState("");

  // Labels amigáveis para exibir no formulário
  const labels = {
    street: "Rua",
    number: "Número",
    district: "Bairro",
    city: "Cidade",
    state: "Estado",
    zipCode: "CEP",
  };

  // -------------------------------------------------------------------
  // CARREGA O ENDEREÇO AO MONTAR O COMPONENTE
  // -------------------------------------------------------------------
  // Observações importantes:
  // - Se o usuário ainda não tem endereço, a API retorna 404 → não tratamos como erro
  // - Preenche as inputs caso o endereço exista
  // -------------------------------------------------------------------
  useEffect(() => {
    API.get("/addresses/me")
      .then((res) => {
        if (res.data) setAddress(res.data); // evita undefined
      })
      .catch(() => {
        // nenhum endereço cadastrado → estado inicial permanece vazio
      })
      .finally(() => setLoading(false));
  }, []);

  // Atualiza estado conforme usuário digita
  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // -------------------------------------------------------------------
  // SALVAR OU EDITAR ENDEREÇO
  // -------------------------------------------------------------------
  // Lógica:
  // - Se houver address.id → PUT (atualização)
  // - Senão → POST (criação)
  //
  // Após salvar, recarrega /users/me para atualizar o contexto global.
  // Isso garante que o AuthContext reflita o endereço atualizado.
  // -------------------------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    setMsgError("");
    setMsgSuccess("");

    try {
      let res;

      // Verifica se estamos atualizando ou criando
      if (address.id) {
        res = await API.put("/addresses", address);
        setMsgSuccess("Endereço atualizado!");
      } else {
        res = await API.post("/addresses", address);
        setMsgSuccess("Endereço cadastrado!");
      }

      // Atualiza estado local com retorno do backend
      setAddress(res.data);

      // Recarrega os dados do usuário para atualizar o contexto global
      const me = await API.get("/users/me");
      setUser(me.data);

    } catch (err) {
      // Backend pode retornar:
      // - "message"
      // - "error"
      // - array: "errors: []"
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || err.response?.data?.error;

      if (Array.isArray(errors) && errors.length > 0) {
        setMsgError(errors.join(" | "));
      } else if (message) {
        setMsgError(message);
      } else {
        setMsgError("Erro ao salvar endereço.");
      }
    }
  };

  // Estado de carregamento inicial
  if (loading) {
    return <div className="p-6 text-center">Carregando endereço...</div>;
  }

  // -------------------------------------------------------------------
  // RENDERIZAÇÃO DO FORMULÁRIO
  // -------------------------------------------------------------------
  // Usa Object.keys(labels) para gerar inputs dinamicamente,
  // reduzindo repetição e mantendo consistência.
  // -------------------------------------------------------------------
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-red-600">
        Meu Endereço 🏠
      </h1>

      {/* Caixa de sucesso */}
      {msgSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg">
          {msgSuccess}
        </div>
      )}

      {/* Caixa de erro */}
      {msgError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {msgError}
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleSave}
        className="space-y-4 bg-white p-6 shadow rounded-xl"
      >
        {/* Inputs gerados dinamicamente */}
        {Object.keys(labels).map((field) => (
          <div key={field}>
            <label className="font-medium block mb-1">{labels[field]}</label>

            <input
              name={field}
              value={address[field] || ""}       // evita undefined
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>
        ))}

        <button className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold">
          Salvar endereço
        </button>
      </form>
    </div>
  );
}
