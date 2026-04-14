import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Categorias } from './pages/Categorias';
import { ClienteDashboard } from './pages/cliente/Dashboard';
import { NovoPedido } from './pages/cliente/NovoPedido';
import { ClientePedidoDetalhe } from './pages/cliente/PedidoDetalhe';
import { ProfissionalDashboard } from './pages/profissional/Dashboard';
import { ProfissionalPedidoDetalhe } from './pages/profissional/PedidoDetalhe';
import { ProfissionalPerfil } from './pages/profissional/Perfil';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/categorias" element={<Categorias />} />

            {/* Cliente */}
            <Route
              path="/cliente"
              element={
                <ProtectedRoute allowedType="cliente">
                  <ClienteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/novo-pedido"
              element={
                <ProtectedRoute allowedType="cliente">
                  <NovoPedido />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/pedido/:id"
              element={
                <ProtectedRoute allowedType="cliente">
                  <ClientePedidoDetalhe />
                </ProtectedRoute>
              }
            />

            {/* Profissional */}
            <Route
              path="/profissional"
              element={
                <ProtectedRoute allowedType="profissional">
                  <ProfissionalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profissional/perfil"
              element={
                <ProtectedRoute allowedType="profissional">
                  <ProfissionalPerfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profissional/pedido/:id"
              element={
                <ProtectedRoute allowedType="profissional">
                  <ProfissionalPedidoDetalhe />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
