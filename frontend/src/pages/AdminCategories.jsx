import { useEffect, useState } from "react";
import API from "../api/api";

// ======================================================================
// COMPONENTE AdminCategories
// ======================================================================
// Responsável por:
// - Listar categorias existentes
// - Criar novas categorias
// - Editar categorias existentes
// - Excluir categorias
//
// Regras importantes:
// - Apenas ADMIN acessa essa tela (rota protegida por ProtectedRoute)
// - Backend valida descrição usando Zod
// - Após qualquer operação (criar/editar/excluir), a lista é recarregada
//
// O estado *editing* controla se estamos editando ou criando.
// ======================================================================

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);   // lista das categorias
  const [description, setDescription] = useState(""); // input do formulário
  const [editing, setEditing] = useState(null);       // id da categoria em edição
  const [loading, setLoading] = useState(true);       // UX: spinner de carregamento
  const [msg, setMsg] = useState("");                 // mensagens de feedback

  // -------------------------------------------------------------------
  // FUNÇÃO PARA BUSCAR CATEGORIAS DO BACKEND
  // -------------------------------------------------------------------
  // Regras:
  // - Atualiza 'loading' para UX responsiva
  // - Em caso de erro, retorna lista vazia (evita travar componente)
  // -------------------------------------------------------------------
  const loadCategories = () => {
    setLoading(true);

    API.get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  // Carrega categorias ao montar o componente
  useEffect(() => {
    loadCategories();
  }, []);

  // -------------------------------------------------------------------
  // CRIAR OU EDITAR CATEGORIA
  // -------------------------------------------------------------------
  // Lógica:
  // - Se tiver 'editing' → PUT
  // - Caso contrário → POST
  //
  // Backend pode retornar:
  // - message
  // - error
  // - errors: []
  //
  // Após salvar:
  // - limpa formulário
  // - recarrega lista
  // - mostra mensagem ao usuário
  // -------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      if (editing) {
        // Atualiza categoria existente
        await API.put(`/categories/${editing}`, { description });
        setMsg("Categoria atualizada com sucesso!");
      } else {
        // Cria nova categoria
        await API.post("/categories", { description });
        setMsg("Categoria criada com sucesso!");
      }

      // Limpa formulário
      setDescription("");
      setEditing(null);

      // Recarrega lista
      loadCategories();

    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || err.response?.data?.error;

      if (Array.isArray(errors) && errors.length > 0) {
        setMsg(errors.join(" | "));
      } else if (message) {
        setMsg(message);
      } else {
        setMsg("Erro ao salvar categoria.");
      }
    }
  };

  // -------------------------------------------------------------------
  // EXCLUSÃO DE CATEGORIA
  // -------------------------------------------------------------------
  // Detalhes importantes:
  // - Confirmação de exclusão evita erros de UX
  // - Após excluir, recarrega lista
  // - Se categoria tem itens vinculados, backend pode impedir exclusão
  // -------------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      await API.delete(`/categories/${id}`);
      setMsg("Categoria removida com sucesso!");
      loadCategories();
    } catch {
      setMsg("Erro ao excluir categoria.");
    }
  };

  // -------------------------------------------------------------------
  // INICIAR EDIÇÃO
  // -------------------------------------------------------------------
  // Preenche formulário com dados existentes para edição
  // -------------------------------------------------------------------
  const startEdit = (cat) => {
    setEditing(cat.id);
    setDescription(cat.description);
  };

  // ====================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ====================================================================
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-red-600">
        Gerenciar Categorias 📦
      </h1>

      {/* Mensagens de feedback */}
      {msg && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg font-medium">
          {msg}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* FORMULÁRIO */}
      {/* ----------------------------------------------------------------- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow rounded-lg space-y-4"
      >
        <h2 className="text-xl font-bold">
          {editing ? "Editar Categoria" : "Criar Categoria"}
        </h2>

        <input
          type="text"
          placeholder="Descrição da categoria"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-3 rounded-lg"
          required
        />

        <button className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold w-full">
          {editing ? "Salvar Alterações" : "Criar Categoria"}
        </button>

        {/* Botão para cancelar edição */}
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDescription("");
            }}
            className="mt-2 w-full bg-gray-300 p-3 rounded-lg font-semibold"
          >
            Cancelar edição
          </button>
        )}
      </form>

      {/* ----------------------------------------------------------------- */}
      {/* LISTA DE CATEGORIAS */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Categorias Existentes</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white shadow p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{cat.description}</p>
                <p className="text-gray-500 text-sm">
                  {cat.items?.length || 0} itens
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(cat)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
