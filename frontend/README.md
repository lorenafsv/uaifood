
---

## 🔐 **Autenticação**

O login é feito via **JWT**.  
Após autenticar:

- o token é armazenado no `localStorage`
- enviado automaticamente via interceptor Axios
- validado no backend em cada request privada

---

## 📑 **Documentação Swagger**

Após rodar o backend:

👉 **http://localhost:5001/api-docs**

Lá você encontra:
- todas as rotas
- exemplos detalhados
- parâmetros e respostas
- fluxo completo de pedidos

---

# 🗄️ Banco de Dados (Prisma + PostgreSQL)

### Modelos principais:

- **User** (CLIENT / ADMIN)
- **Address**
- **Category**
- **Item**
- **Order**
- **OrderItem**

### Comandos úteis:

```bash
# Gerar client
npx prisma generate

# Ver estrutura visual
npx prisma studio

# Aplicar migrations
npx prisma migrate dev

# Rodar seed
npx prisma db seed
