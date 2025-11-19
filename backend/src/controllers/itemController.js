import prisma from "../../prisma/client.js";

/**
 * CONTROLLER DE ITENS DO CARDÁPIO
 *
 * Os itens são elementos principais do cardápio (lanche, bebida etc.). 
 * Eles pertencem a uma categoria e podem aparecer em pedidos (OrderItem).
 *
 * Este controller oferece:
 *  - listagem completa
 *  - busca por ID
 *  - criação
 *  - atualização
 *  - deleção
 *
 * OBSERVAÇÃO:
 *  - Em operações de deleção, pode ocorrer erro se o item estiver vinculado
 *    a pedidos existentes (dependendo do comportamento de FKs no banco).
 */

// ===============================
// LISTAR TODOS OS ITENS
// ===============================
export const getItems = async (req, res) => {
  try {
    // Retorna todos os itens com suas categorias.
    // Isso evita uma segunda requisição para descobrir a categoria no front.
    const items = await prisma.item.findMany({
      include: { category: true },
    });

    return res.status(200).json(items);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// BUSCAR ITEM POR ID
// ===============================
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca item específico e inclui categoria associada
    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });

    if (!item) {
      return res.status(404).json({ message: "Item não encontrado." });
    }

    return res.status(200).json(item);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// CRIAR ITEM
// ===============================
export const createItem = async (req, res) => {
  try {
    const { description, unitPrice, imageUrl, categoryId } = req.body;

    // Criação simples de item. 
    // A validação do categoryId e tipos já é feita no schema Zod.
    const item = await prisma.item.create({
      data: { description, unitPrice, imageUrl, categoryId },
    });

    return res.status(201).json(item);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// ATUALIZAR ITEM
// ===============================
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, unitPrice, imageUrl, categoryId } = req.body;

    // Prisma lança erro P2025 quando o registro não existe.
    const updated = await prisma.item.update({
      where: { id: Number(id) },
      data: { description, unitPrice, imageUrl, categoryId },
    });

    return res.status(200).json(updated);

  } catch (error) {
    // Captura o erro de “registro não encontrado”
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Item não encontrado." });
    }

    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// DELETAR ITEM
// ===============================
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Deleção direta. Caso o item esteja vinculado a pedidos,
    // o banco pode impedir a remoção dependendo das FKs.
    await prisma.item.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Item deletado com sucesso." });

  } catch (error) {
    // Caso o item não exista
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Item não encontrado." });
    }

    return res.status(500).json({ error: error.message });
  }
};
