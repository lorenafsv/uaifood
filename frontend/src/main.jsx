import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Importa os estilos globais (Tailwind + ajustes personalizados)
import './index.css'

// Componente raiz da aplicação (todas as rotas e contextos ficam dentro dele)
import App from './App.jsx'

// Renderiza a aplicação React dentro da div #root
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode ajuda a identificar problemas e práticas inseguras em dev */}
    <App />
  </StrictMode>,
)
