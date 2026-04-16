import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setError('Erro ao enviar e-mail. Verifique o endereço.');
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <Wrench className="w-7 h-7" />
            ArrumaJá
          </Link>
          <p className="text-gray-500 mt-2">Recuperar senha</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">E-mail enviado!</h2>
              <p className="text-sm text-gray-500">
                Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para redefinir sua senha.
              </p>
              <Link to="/login" className="text-sm text-primary-600 hover:underline font-medium">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

              <p className="text-sm text-gray-600">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="seu@email.com" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
                <ArrowLeft className="w-4 h-4" /> Voltar ao login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
