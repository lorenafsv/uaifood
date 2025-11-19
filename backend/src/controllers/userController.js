import prisma from "../../prisma/client.js";
import bcrypt from "bcrypt";
import {
  generateToken,
  verifyToken,
  blacklistToken,
} from "../config/jwtConfig.js";

/**
 * CONTROLLER DE USUÁRIO (User)
 *
 * Responsável por:
 *  - Criar usuários
 *  - Autenticação (login)
 *  - Logout (invalidando token)
 *  - Buscar usuários
 *  - Atualizar dados de usuários
 *
 * Pontos de segurança importantes:
 *  - Toda senha deve ser armazenada de forma hash (bcrypt)
 *  - Type do usuário nunca deve ser definido externamente no cadastro
 *  - Apenas admin pode enxergar outros usuários
 *  - Cliente só pode acessar e editar ele mesmo
 */

// ========================================
// CRIAR USUÁRIO (CLIENT)
// ========================================
export const createUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Hash de senha para garantir proteção em caso de vazamento.
    const hashedPassword = await bcrypt.hash(password, 10);

    /**
     * Cria um novo usuário obrigatoriamente como CLIENT.
     * Isso impede que alguém tente criar conta como ADMIN.
     */
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        type: "CLIENT", // Segurança: o tipo nunca vem do body.
      },
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      user,
    });

  } catch (error) {
    // P2002 = unique constraint (email)
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "E-mail já está em uso por outro usuário." });
    }
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// LOGIN
// ========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Valida senha + existência do usuário
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    /**
     * Gera JWT contendo:
     * - id
     * - nome
     * - tipo
     * Usado para proteger rotas com autenticação.
     */
    const token = generateToken(user);

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        type: user.type,
      },
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// LOGOUT
// ========================================
export const logout = async (req, res) => {
  try {
    /**
     * O token é colocado em blacklist até expirar.
     * Isso impede que continue sendo usado após logout.
     */
    const token = req.headers.authorization?.split(" ")[1];
    blacklistToken(token);

    return res.status(200).json({ message: "Logout realizado com sucesso." });

  } catch {
    return res.status(500).json({ error: "Erro ao realizar logout." });
  }
};

// ========================================
// LISTAR TODOS OS USUÁRIOS (ADMIN)
// ========================================
export const getUsers = async (req, res) => {
  try {
    /**
     * Busca completa — útil para dashboards administrativos.
     * Inclui também o endereço do usuário.
     */
    const users = await prisma.user.findMany({
      include: { address: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(users);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// BUSCAR USUÁRIO POR ID
// ========================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    /**
     * Segurança:
     *  - CLIENT só pode visualizar ele mesmo
     *  - ADMIN pode visualizar qualquer usuário
     */
    if (req.user.type === "CLIENT" && req.user.id !== Number(id)) {
      return res.status(403).json({
        message: "Você não tem permissão para acessar este usuário.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { address: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// ATUALIZAR USUÁRIO
// ========================================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    /**
     * Segurança:
     * - CLIENT só pode atualizar seu próprio usuário
     * - ADMIN pode atualizar qualquer usuário
     */
    if (req.user.type === "CLIENT" && req.user.id !== Number(id)) {
      return res.status(403).json({
        message: "Você não tem permissão para atualizar este usuário.",
      });
    }

    const { name, phone, email, password } = req.body;

    // Apenas campos enviados serão atualizados
    const data = { name, phone, email };

    // Se o usuário enviou nova senha, hasheia antes de salvar
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    return res.status(200).json(updated);

  } catch (error) {
    // erro de email duplicado
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "E-mail já está em uso por outro usuário." });
    }
    return res.status(500).json({ error: error.message });
  }
};

// ========================================
// GET /users/me
// ========================================
export const getMe = async (req, res) => {
  try {
    /**
     * Retorna os dados do usuário logado.
     * Muito útil para preencher perfil e validações no frontend.
     */
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { address: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
