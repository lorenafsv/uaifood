import axios from "axios";

// ======================================================================
// CONFIGURAÇÃO GLOBAL DA API
// ======================================================================
// Contem:
// - URL base da API
// - Token JWT automático em todas as requisições
//
const API = axios.create({
  // Usa a variável de ambiente definida no Vite
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
export default API;
