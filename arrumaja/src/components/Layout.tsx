import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Wrench, LogOut, Menu, X, Bell, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuthContext } from '../hooks/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

export function Layout() {
  const { user, signOut } = useAuthContext();
  const { unreadCount } = useNotifications(user?.id);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const dashboardPath = user?.tipo === 'admin' ? '/admin' : user?.tipo === 'profissional' ? '/profissional' : '/cliente';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <Wrench className="w-6 h-6" />
            ArrumaJá
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/servicos" className="text-gray-600 hover:text-primary-600 transition-colors">
              Serviços
            </Link>
            <Link to="/profissionais" className="text-gray-600 hover:text-primary-600 transition-colors">
              Profissionais
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="text-gray-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                {user.tipo === 'profissional' && (
                  <Link to="/profissional/planos" className="text-accent-600 hover:text-accent-700 transition-colors font-medium">
                    Planos
                  </Link>
                )}
                {user.tipo === 'admin' && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 transition-colors font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(dashboardPath + '/notificacoes')}
                    className="relative text-gray-500 hover:text-primary-600 transition-colors"
                    aria-label="Notificações"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <span className="text-sm text-gray-500">{user.nome}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Sair"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <Link to="/servicos" className="block text-gray-600 hover:text-primary-600" onClick={() => setMenuOpen(false)}>
              Serviços
            </Link>
            <Link to="/profissionais" className="block text-gray-600 hover:text-primary-600" onClick={() => setMenuOpen(false)}>
              Profissionais
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="block text-gray-600 hover:text-primary-600" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                {user.tipo === 'profissional' && (
                  <Link to="/profissional/planos" className="block text-accent-600 hover:text-accent-700 font-medium" onClick={() => setMenuOpen(false)}>
                    Planos
                  </Link>
                )}
                {user.tipo === 'admin' && (
                  <Link to="/admin" className="block text-red-600 hover:text-red-700 font-medium" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <Link to={dashboardPath + '/notificacoes'} className="block text-gray-600 hover:text-primary-600" onClick={() => setMenuOpen(false)}>
                  Notificações {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleSignOut(); }}
                  className="flex items-center gap-2 text-red-500"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 hover:text-primary-600" onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
                <Link to="/cadastro" className="block bg-primary-600 text-white text-center px-4 py-2 rounded-lg" onClick={() => setMenuOpen(false)}>
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            <span className="font-semibold text-white">ArrumaJá</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} ArrumaJá. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
