import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminCategories from "./pages/AdminCategories";
import AdminItems from "./pages/AdminItems";
import AdminOrders from "./pages/AdminOrders";
import Address from "./pages/Address";

export default function App() {
  return (
    // ======================================================================
    // CONTEXTOS GLOBAIS
    // ======================================================================
    // AuthProvider controla sessão do usuário (login, logout, /me)
    // CartProvider, carrinho persistido no localStorage
    // Ambos envolvem TODA a aplicação para que qualquer componente possa usar
    // ======================================================================
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
            {/* ================================================================
                ROTAS PÚBLICAS
                ============================================================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ================================================================
                ROTAS PROTEGIDAS PARA CLIENT E ADMIN
                ============================================================== */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowed={["CLIENT", "ADMIN"]}>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowed={["CLIENT", "ADMIN"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/address"
              element={
                <ProtectedRoute allowed={["CLIENT", "ADMIN"]}>
                  <Address />
                </ProtectedRoute>
              }
            />

            {/* ================================================================
                ROTAS EXCLUSIVAS DO CLIENT
                ============================================================== */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowed={["CLIENT"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute allowed={["CLIENT"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowed={["CLIENT"]}>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* ================================================================
                ROTAS EXCLUSIVAS DO ADMIN
                ============================================================== */}
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowed={["ADMIN"]}>
                  <AdminCategories />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/items"
              element={
                <ProtectedRoute allowed={["ADMIN"]}>
                  <AdminItems />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowed={["ADMIN"]}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
