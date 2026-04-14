import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Wrench, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthContext } from '../hooks/AuthContext';

export function Layout() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

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
            <Link to="/categorias" className="text-gray-600 hover:text-primary-600 transition-colors">
              Categorias
            </Link>
            {user ? (
              <>
                <Link
                  to={user.tipo === 'cliente' ? '/cliente' : '/profissional'}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
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
            <Link
              to="/categorias"
              className="block text-gray-600 hover:text-primary-600"
              onClick={() => setMenuOpen(false)}
            >
              Categorias
            </Link>
            {user ? (
              <>
                <Link
                  to={user.tipo === 'cliente' ? '/cliente' : '/profissional'}
                  className="block text-gray-600 hover:text-primary-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-600 hover:text-primary-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="block bg-primary-600 text-white text-center px-4 py-2 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
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
