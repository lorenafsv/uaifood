# 🍽️ Uaifood — Sistema de Pedidos de Comida

Aplicação Full Stack desenvolvida com **React + Node + Express + PostgreSQL + Prisma**.

Este projeto simula uma plataforma de delivery, permitindo que usuários façam pedidos, acompanhem status, gerenciem perfil e naveguem por itens organizados por categorias. Administradores podem cadastrar produtos, categorias e gerenciar pedidos.

---

## 📌 Índice

- [Arquitetura Geral](#-arquitetura-geral)
- [Back-end](#-back-end)
- [Front-end](#-front-end)
- [Executando o Projeto](#-como-executar)
- [Fluxo da Aplicação](#-fluxo-da-aplicação)
- [Pontos Fortes e de Melhoria](#-pontos-fortes-e-pontos-de-melhoria)

---

## 🏗️ Arquitetura Geral

A aplicação segue o padrão **cliente-servidor**:

```
Frontend (React + Vite + Tailwind)
              ↓ requisições HTTP
Backend (Node.js + Express + Prisma + JWT)
              ↓ queries
Banco PostgreSQL
```

### Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Autenticação** | JWT (JSON Web Tokens) |
| **Banco de Dados** | PostgreSQL |
| **ORM** | Prisma |
| **Interface** | React + Vite |
| **Estilo** | Tailwind CSS |
| **Documentação da API** | Swagger |

---

## 🔧 Back-end

O back-end foi desenvolvido em **Node.js com Express**, organizado de forma modular, seguindo os princípios de responsabilidade única.

### 📁 Organização do Schema de Dados

O banco foi estruturado com as seguintes entidades principais:

- **Usuário** – dados de login, perfil e tipo (ADMIN/CLIENT)
- **Categoria** – categorias de itens (Lanches, Bebidas, etc.)
- **Item** – produtos disponíveis para pedido
- **Endereço** – endereço de entrega do usuário
- **Pedido** – pedidos feitos pelos clientes
- **OrderItem** – itens contidos em cada pedido

#### Principais relações:

- 1 usuário → muitos endereços
- 1 categoria → muitos itens
- 1 pedido → muitos itens de pedido
- 1 usuário → muitos pedidos

O **Prisma** é responsável por mapear e garantir integridade entre as tabelas.

### 📁 Controllers

Localizados em: `/backend/src/controllers/`

| Controller | Responsabilidades |
|-----------|------------------|
| **userController** | Registro, login, perfil, logout |
| **itemController** | CRUD de itens |
| **categoryController** | CRUD de categorias |
| **orderController** | Criação e atualização de pedidos |
| **addressController** | CRUD de endereços |

#### Fluxo de um Controller:

1. Receber a requisição
2. Validar dados (com Joi + middlewares)
3. Chamar a lógica de negócio
4. Retornar a resposta

### 🔗 Rotas

Localizadas em: `/backend/src/routes/`

```
itemRoutes.js
categoryRoutes.js
userRoutes.js
orderRoutes.js
addressRoutes.js
```

Cada rota aplica:
- 🔐 **Autenticação** (`autenticarToken`)
- 🛡️ **Autorização** (`authorizeRole`)
- ✅ **Validação** (`validate(schema)`)
- 📍 **Direcionamento** para o controller

### 📚 Bibliotecas Utilizadas

#### Produção

- **express** – criação da API REST
- **jsonwebtoken** – autenticação JWT
- **bcrypt** – hashing seguro de senhas
- **joi** – validação de dados
- **prisma** – ORM para acesso ao banco
- **pg** – driver PostgreSQL
- **cors** – liberar acesso do frontend
- **dotenv** – variáveis de ambiente
- **nodemailer** – envio de e-mails
- **swagger-ui-express** – documentação interativa

#### Desenvolvimento

- **nodemon** – reload automático
- **eslint** – padronização de código

### ▶️ Como executar o Back-end

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

**Configurar arquivo `.env`:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/uaifood"
JWT_SECRET="sua_senha_secreta_bem_forte"
PORT=3000
```

---

## 🖥️ Front-end

O front-end foi desenvolvido em **React com Vite**, oferecendo uma interface moderna e responsiva.

### ⚙️ Tecnologia Utilizada

- **React** com Vite (construção rápida)
- **Tailwind CSS** (utilitários de estilo)
- **Axios** (requisições HTTP)
- **React Router Dom** (navegação entre páginas)
- **React Toastify** (notificações/alertas)
- **Context API** (gerenciamento de autenticação)

### 📂 Organização do Código

```
frontend/src/
├── pages/          # Telas completas (Login, Home, Cart, etc.)
├── components/     # Componentes reutilizáveis (Navbar, ItemCard, etc.)
├── api/            # Axios configurado com interceptadores
├── context/        # Contextos (AuthContext, CartContext)
├── assets/         # Imagens e recursos estáticos
└── index.css       # Estilos globais
```

#### Detalhamento:

- **pages**: Telas completas da aplicação
- **components**: Componentes reutilizáveis (Navbar, ItemCard, etc.)
- **api**: Instância Axios com baseURL pré-configurada
- **context**: Controle de estado global (autenticação, carrinho)
- **assets**: Imagens e recursos estáticos
- **styles**: Configurações globais (Tailwind CSS)

### 🧭 Principais Telas

- 🔑 **Login e Registro** – autenticação de usuários
- 🍔 **Menu de Itens** – catálogo com filtro por categoria
- 🛒 **Carrinho** – revisar e modificar itens antes de comprar
- 📦 **Meus Pedidos** – acompanhar status de pedidos
- ⚙️ **Admin Items/Categorias** – gerenciar catálogo (apenas ADMIN)
- 👤 **Perfil do Usuário** – editar dados e endereço
- 📍 **Endereço** – adicionar/editar endereço de entrega

O fluxo segue uma navegação intuitiva, com validações e mensagens claras ao usuário.

### 🎨 Mensagens de Sucesso e Erro

Implementadas com **React Toastify**:

- ✅ **Sucesso** → exibido em verde
- ❌ **Erro** → exibido em vermelho
- ⚠️ **Validações** → exibido em amarelo

#### Exemplos de erros validados:

- Token inválido ou expirado
- Criar item sem categoria
- Tentar acessar rota admin sem ser admin
- Falha ao fazer login

### ▶️ Como executar o Front-end

```bash
cd frontend
npm install
npm run dev
```

**Configurar arquivo `.env.local`:**

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js (v16+)
- PostgreSQL instalado e rodando
- npm ou yarn

### Executar Tudo

1. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   # Backend rodando em http://localhost:3000
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Frontend rodando em http://localhost:5173
   ```

3. **Acessar a aplicação:**
   - Abra [http://localhost:5173](http://localhost:5173)

---

## 🔄 Fluxo da Aplicação

```
[Usuário Visitante]
        ↓
   [Login/Registro]
        ↓
[Usuário Autenticado]
   ├─→ [Se ADMIN]
   │    ├─ Gerenciar Categorias
   │    ├─ Gerenciar Itens
   │    └─ Gerenciar Pedidos
   │
   └─→ [Se CLIENT]
        ├─ Navegar Catálogo
        ├─ Adicionar ao Carrinho
        ├─ Fazer Checkout
        ├─ Acompanhar Pedidos
        └─ Editar Perfil
```

---

## ⭐ Pontos Fortes e Pontos de Melhoria

### ✅ Pontos Fortes

- Arquitetura modular e escalável
- Autenticação segura com JWT + bcrypt
- Validação robusta de dados (Joi)
- Interface responsiva (Tailwind CSS)
- Banco de dados bem estruturado (Prisma)
- Documentação clara com comentários

### 🔧 Pontos de Melhoria

- Adicionar testes automatizados (Jest, Vitest)
- Implementar cache (Redis)
- Melhorar tratamento de erros com logging centralizado
- Adicionar paginação no carregamento de itens
- Implementar busca/filtro avançado
- Melhorar performance com lazy loading
- Adicionar sistema de avaliações e comentários

---

## 📝 Licença

Este projeto é de código aberto e está disponível.