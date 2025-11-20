import { useEffect, useState } from "react";
import API from "../api/api";

// ======================================================================
// COMPONENTE AdminItems
// ======================================================================
// Responsável por:
//
// - Listar itens existentes
// - Listar categorias (necessário para selecionar categoria do item)
// - Criar itens
// - Editar itens existentes
// - Excluir itens
// ======================================================================

export default function AdminItems() {

  // Lista de itens carregados do backend
  const [items, setItems] = useState([]);

  // Lista de categorias
  const [categories, setCategories] = useState([]);

  // Estado do formulário
  const [form, setForm] = useState({
    description: "",
    unitPrice: "",
    imageUrl: "",
    categoryId: "",
  });

  // Se 'editing' tiver um ID, estamos editando o item
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");

  // Em vez de fazer 2 requisições separadas
  // usamos Promise.all() para rodar em paralelo — melhora performance.
  // --------------------------------------------------------------------
  const loadData = () => {
    setLoading(true);

    Promise.all([
      API.get("/items"),
      API.get("/categories")
    ])
      .then(([itemsRes, catRes]) => {
        setItems(itemsRes.data);
        setCategories(catRes.data);
      })
      .finally(() => setLoading(false));
  };

  // Carrega tudo ao montar componente
  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------------------------
  // SUBMISSÃO DO FORMULÁRIO DE CRIAÇÃO/EDIÇÃO
  // --------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const payload = {
      description: form.description,
      unitPrice: Number(form.unitPrice),
      imageUrl: form.imageUrl,
      categoryId: Number(form.categoryId),
    };

    try {
      if (editing) {
        // Editar item existente
        await API.put(`/items/${editing}`, payload);
        setMsg("Item atualizado com sucesso!");
      } else {
        // Criar item
        await API.post("/items", payload);
        setMsg("Item criado com sucesso!");
      }

      // Reseta formulário
      setForm({
        description: "",
        unitPrice: "",
        imageUrl: "",
        categoryId: "",
      });

      setEditing(null);

      // Recarrega lista atualizada
      loadData();

    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || err.response?.data?.error;

      if (Array.isArray(errors) && errors.length > 0) {
        setMsg(errors.join(" | "));
      } else if (message) {
        setMsg(message);
      } else {
        setMsg("Erro ao salvar item.");
      }
    }
  };

  // --------------------------------------------------------------------
  // EXCLUSÃO DE ITEM
  // --------------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esse item?")) return;

    try {
      await API.delete(`/items/${id}`);
      setMsg("Item excluído com sucesso!");
      loadData();
    } catch {
      setMsg("Erro ao excluir item.");
    }
  };

  // --------------------------------------------------------------------
  // INICIAR MODO DE EDIÇÃO
  // --------------------------------------------------------------------
  // Preenche formulário com os dados do item selecionado.
  // Habilita modo edição via editing.
  // --------------------------------------------------------------------
  const startEdit = (item) => {
    setEditing(item.id);
    setForm({
      description: item.description,
      unitPrice: item.unitPrice,
      imageUrl: item.imageUrl || "",
      categoryId: item.categoryId,
    });
  };

  // =====================================================================
  // RENDER
  // =====================================================================
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-red-600">
        Gerenciar Itens 🍔
      </h1>

      {/* Mensagens de feedback */}
      {msg && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg font-medium">
          {msg}
        </div>
      )}

      {/* ================================================================= */}
      {/* FORMULÁRIO DE CRIAÇÃO/EDIÇÃO */}
      {/* ================================================================= */}
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
        <h2 className="text-xl font-bold">
          {editing ? "Editar Item" : "Criar Item"}
        </h2>

        <input
          type="text"
          placeholder="Descrição"
          className="w-full border p-3 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <input
          type="number"
          step="0.01"
          placeholder="Preço"
          className="w-full border p-3 rounded"
          value={form.unitPrice}
          onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="URL da Imagem"
          className="w-full border p-3 rounded"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />

        <select
          className="w-full border p-3 rounded bg-white"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
        >
          <option value="">Selecione uma categoria</option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.description}
            </option>
          ))}
        </select>

        <button className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold">
          {editing ? "Salvar Alterações" : "Criar Item"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                description: "",
                unitPrice: "",
                imageUrl: "",
                categoryId: "",
              });
            }}
            className="mt-2 w-full bg-gray-300 p-3 rounded-lg font-semibold"
          >
            Cancelar edição
          </button>
        )}
      </form>

      {/* ================================================================= */}
      {/* LISTA DE ITENS */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Itens cadastrados</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Nenhum item cadastrado.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 shadow rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-4">

                {/* Imagem do item */}
                <img
                  src={item.imageUrl}
                  className="w-20 h-20 object-cover rounded"
                />

                <div>
                  <p className="font-semibold">{item.description}</p>

                  <p className="text-red-600 font-bold">
                    R$ {item.unitPrice.toFixed(2)}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Categoria: {item.category?.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(item)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
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
