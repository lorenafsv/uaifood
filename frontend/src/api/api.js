import axios from "axios";

// ======================================================================
// CONFIGURAÇÃO GLOBAL DA API
// ======================================================================
// Criamos uma instância personalizada do Axios para centralizar:
// - URL base da API
// - Token JWT automático em todas as requisições
// - Integração futura com interceptors de erro, loading etc.
//
// Isso evita duplicar lógica em cada chamada e deixa o frontend
// desacoplado dos detalhes internos de autenticação.
//
const API = axios.create({
  // Usa a variável de ambiente definida no Vite
  // Ex: http://localhost:5001
  baseURL: import.meta.env.VITE_API_URL,
});


// ======================================================================
// INTERCEPTOR DE REQUISIÇÃO
// ======================================================================
// Antes de cada requisição, este interceptor é executado automaticamente.
//
// Finalidade:
// - Enviar o token JWT no header Authorization
// - Manter o usuário autenticado sem repetir código
//
// Fluxo:
// 1. Lê o token armazenado no localStorage
// 2. Se existir, adiciona no header da requisição:
//        Authorization: Bearer <token>
// 3. Retorna a config modificada
//
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    // Header padrão para APIs que usam JWT
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ======================================================================
// EXPORTAÇÃO
// ======================================================================
// Exportamos a instância para ser usada em todo o frontend.
// Basta chamar:
//
//    API.get("/items");
//    API.post("/users/login", body);
//
export default API;
