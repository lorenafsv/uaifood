import { useEffect, useState } from "react";
import API from "../api/api";
import ItemCard from "../components/ItemCard";

export default function Home() {

  // =====================================================================
  // ESTADOS DO COMPONENTE
  // =====================================================================
  //
  // - categories → contém TODAS as categorias vindas do backend
  // =====================================================================
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================================
  // CARREGAMENTO INICIAL DO CARDÁPIO
  // =====================================================================
  //
  // O useEffect roda uma vez ao montar a página:
  // - Chama GET /categories
  // - Cada categoria já vem com sua lista de itens (include no backend)
  // =====================================================================
  useEffect(() => {
    API.get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))  // fallback seguro
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Carregando cardápio...
      </div>
    );
  }

  // =====================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // =====================================================================
  //
  // - Nome de cada categoria
  // - Grid de itens (ItemCard) dentro de cada categoria
  // =====================================================================
  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold text-red-600 mb-4">Cardápio 🍽️</h1>

      {/* Caso não existam categorias */}
      {categories.length === 0 && (
        <p className="text-center text-gray-500">
          Nenhuma categoria cadastrada.
        </p>
      )}

      {/* Renderização das categorias */}
      {categories.map((cat) => (
        <div key={cat.id} className="space-y-4">

          {/* Nome da categoria */}
          <h2 className="text-2xl font-bold">{cat.description}</h2>

          {/* Caso a categoria não tenha itens */}
          {cat.items.length === 0 ? (
            <p className="text-gray-500">Nenhum item nesta categoria.</p>
          ) : (

            // Grid responsivo de itens
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {cat.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
