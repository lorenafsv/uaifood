import prisma from "../../prisma/client.js";

/**
 * CONTROLLERS DE ENDEREÇO DO USUÁRIO AUTENTICADO
 *
 * Este controller trabalha exclusivamente com o endereço associado ao usuário
 * do token JWT. Ou seja:
 *  - Não permite manipular endereços de terceiros
 *  - Todas as operações usam req.user.id como chave
 */

// ===============================
// GET /addresses/me
// ===============================
export const getMyAddress = async (req, res) => {
  try {
    // Busca endereço pelo userId vindo do token
    const address = await prisma.address.findUnique({
      where: { userId: req.user.id },
    });

    // Usuário pode existir sem endereço cadastrado (fluxo normal)
    if (!address) {
      return res.status(404).json({ message: "Nenhum endereço cadastrado." });
    }

    return res.json(address);

  } catch (error) {
    // Erro inesperado de banco ou servidor
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// POST /addresses
// ===============================
export const createMyAddress = async (req, res) => {
  try {
    // Cada usuário só pode ter um endereço (userId é unique na tabela)
    const exists = await prisma.address.findUnique({
      where: { userId: req.user.id },
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Você já possui um endereço cadastrado." });
    }

    // Cria o endereço vinculado automaticamente ao usuário autenticado
    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        ...req.body,
      },
    });

    return res.status(201).json(address);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// PUT /addresses
// ===============================
export const updateMyAddress = async (req, res) => {
  try {
    // Antes de atualizar, verifica se o usuário já tem endereço
    const exists = await prisma.address.findUnique({
      where: { userId: req.user.id },
    });

    if (!exists) {
      return res.status(404).json({ message: "Endereço não encontrado." });
    }

    // Atualiza apenas o endereço do próprio usuário
    const updated = await prisma.address.update({
      where: { userId: req.user.id },
      data: req.body,
      
    });

    return res.json(updated);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ===============================
// DELETE /addresses
// ===============================
export const deleteMyAddress = async (req, res) => {
  try {
    // Confirma que o usuário tem endereço para excluir
    const exists = await prisma.address.findUnique({
      where: { userId: req.user.id },
    });

    if (!exists) {
      return res.status(404).json({ message: "Endereço não encontrado." });
    }

    // Deleta o endereço vinculado ao usuário autenticado
    await prisma.address.delete({
      where: { userId: req.user.id },
    });

    return res.json({ message: "Endereço removido com sucesso." });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
