import prisma from "../../prisma/client.js";

/**
 * CONTROLLER DE CATEGORIAS
 *
 * As categorias são usadas para organizar os itens do cardápio (lanches,
 * bebidas, sobremesas, promoções etc.). Não há vínculo com usuários, então
 * esse controller é simples, mas ainda precisa tratar casos de erro e FKs.
 *
 * Rotas típicas:
 *  - GET    /categories
 *  - GET    /categories/:id
 *  - POST   /categories
 *  - PUT    /categories/:id
 *  - DELETE /categories/:id
 *
 * Todas as operações utilizam o Prisma e tratam erros específicos como
 * P2025 (registro não encontrado).
 */

// ===============================
// LISTAR TODAS AS CATEGORIAS
// ===============================
export const getCategories = async (req, res) => {
  try {
    // Busca todas as categorias e já retorna os itens relacionados.
    // Isso facilita o frontend montar o cardápio sem múltiplas requisições.
    const categories = await prisma.category.findMany({
      include: { items: true },
    });

    return res.status(200).json(categories);

  } catch (error) {
    // Erros aqui normalmente são do Prisma ou do banco.
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// BUSCAR CATEGORIA POR ID
// ===============================
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca única categoria + seus itens
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    // Caso o ID não exista no banco
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    return res.status(200).json(category);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// CRIAR CATEGORIA
// ===============================
export const createCategory = async (req, res) => {
  try {
    const { description } = req.body;

    // Cria a categoria com descrição validada pelo middleware validate
    const category = await prisma.category.create({
      data: { description },
    });

    return res.status(201).json(category);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// ATUALIZAR CATEGORIA
// ===============================
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    // Atualização direta — se o ID não existir, Prisma lança P2025
    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { description },
    });

    return res.status(200).json(updated);

  } catch (error) {
    // P2025 → registro não encontrado para update
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// DELETAR CATEGORIA
// ===============================
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Exclusão direta.
    // OBS: se houver itens vinculados, essa operação pode falhar dependendo do
    // comportamento de FK configurado no banco (Restrict / Cascade).
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Categoria deletada com sucesso." });

  } catch (error) {
    // Mesmo comportamento do update → ID não existe
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    return res.status(500).json({ error: error.message });
  }
};
