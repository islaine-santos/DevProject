import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Servicos } from './pages/Servicos';
import { BuscarProfissionais } from './pages/BuscarProfissionais';
import { PerfilProfissional } from './pages/PerfilProfissional';

// Client pages
import { ClienteDashboard } from './pages/cliente/Dashboard';
import { NovoPedido } from './pages/cliente/NovoPedido';
import { ClientePedidoDetalhe } from './pages/cliente/PedidoDetalhe';
import { ClienteNotificacoes } from './pages/cliente/Notificacoes';
import { ClienteClube } from './pages/cliente/Clube';

// Professional pages
import { ProfissionalDashboard } from './pages/profissional/Dashboard';
import { ProfissionalPedidoDetalhe } from './pages/profissional/PedidoDetalhe';
import { ProfissionalPerfil } from './pages/profissional/Perfil';
import { Planos } from './pages/profissional/Planos';
import { ProfissionalCarteira } from './pages/profissional/Carteira';
import { ProfissionalKyc } from './pages/profissional/Kyc';
import { ProfissionalNotificacoes } from './pages/profissional/Notificacoes';
import { MinhasPropostas } from './pages/profissional/MinhasPropostas';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminPedidos } from './pages/admin/Pedidos';
import { AdminProfissionais } from './pages/admin/Profissionais';
import { AdminKycReview } from './pages/admin/KycReview';
import { AdminServicos } from './pages/admin/ServicosAdmin';
import { AdminCampanhas } from './pages/admin/Campanhas';
import { AdminIncidentes } from './pages/admin/Incidentes';

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
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/profissionais" element={<BuscarProfissionais />} />
            <Route path="/profissional/:id" element={<PerfilProfissional />} />

            {/* Cliente */}
            <Route path="/cliente" element={<ProtectedRoute allowedType="cliente"><ClienteDashboard /></ProtectedRoute>} />
            <Route path="/cliente/novo-pedido" element={<ProtectedRoute allowedType="cliente"><NovoPedido /></ProtectedRoute>} />
            <Route path="/cliente/pedido/:id" element={<ProtectedRoute allowedType="cliente"><ClientePedidoDetalhe /></ProtectedRoute>} />
            <Route path="/cliente/notificacoes" element={<ProtectedRoute allowedType="cliente"><ClienteNotificacoes /></ProtectedRoute>} />
            <Route path="/cliente/clube" element={<ProtectedRoute allowedType="cliente"><ClienteClube /></ProtectedRoute>} />

            {/* Profissional */}
            <Route path="/profissional" element={<ProtectedRoute allowedType="profissional"><ProfissionalDashboard /></ProtectedRoute>} />
            <Route path="/profissional/perfil" element={<ProtectedRoute allowedType="profissional"><ProfissionalPerfil /></ProtectedRoute>} />
            <Route path="/profissional/planos" element={<ProtectedRoute allowedType="profissional"><Planos /></ProtectedRoute>} />
            <Route path="/profissional/carteira" element={<ProtectedRoute allowedType="profissional"><ProfissionalCarteira /></ProtectedRoute>} />
            <Route path="/profissional/kyc" element={<ProtectedRoute allowedType="profissional"><ProfissionalKyc /></ProtectedRoute>} />
            <Route path="/profissional/notificacoes" element={<ProtectedRoute allowedType="profissional"><ProfissionalNotificacoes /></ProtectedRoute>} />
            <Route path="/profissional/propostas" element={<ProtectedRoute allowedType="profissional"><MinhasPropostas /></ProtectedRoute>} />
            <Route path="/profissional/pedido/:id" element={<ProtectedRoute allowedType="profissional"><ProfissionalPedidoDetalhe /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedType="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/pedidos" element={<ProtectedRoute allowedType="admin"><AdminPedidos /></ProtectedRoute>} />
            <Route path="/admin/profissionais" element={<ProtectedRoute allowedType="admin"><AdminProfissionais /></ProtectedRoute>} />
            <Route path="/admin/kyc" element={<ProtectedRoute allowedType="admin"><AdminKycReview /></ProtectedRoute>} />
            <Route path="/admin/servicos" element={<ProtectedRoute allowedType="admin"><AdminServicos /></ProtectedRoute>} />
            <Route path="/admin/campanhas" element={<ProtectedRoute allowedType="admin"><AdminCampanhas /></ProtectedRoute>} />
            <Route path="/admin/incidentes" element={<ProtectedRoute allowedType="admin"><AdminIncidentes /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
