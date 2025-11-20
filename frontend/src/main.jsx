import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Importa os estilos globais (Tailwind)
import './index.css'

// Componente raiz da aplicação
import App from './App.jsx'

// Renderiza a aplicação React dentro da div #root
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
