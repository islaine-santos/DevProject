import { useState, type FormEvent } from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { supabase } from '../../lib/supabase';
import { AvatarUpload } from '../../components/AvatarUpload';

export function ClienteConta() {
  const { user } = useAuthContext();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess(false);

    const { error: err } = await supabase
      .from('users')
      .update({ nome, telefone })
      .eq('id', user.id);

    if (err) {
      setError('Erro ao salvar alterações.');
    } else {
      setSuccess(true);
    }
    setSaving(false);
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Minha Conta</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <AvatarUpload currentUrl={user.avatar_url} onUploaded={() => {}} />
          <div>
            <h2 className="font-semibold text-gray-900">{user.nome}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">Alterações salvas!</div>}

          <div>
            <label htmlFor="nome" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4" /> Nome
            </label>
            <input id="nome" type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4" /> E-mail
            </label>
            <input type="email" value={user.email} disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>

          <div>
            <label htmlFor="telefone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4" /> Telefone
            </label>
            <input id="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="(11) 99999-9999" />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Tipo de conta: <strong className="text-gray-700">Cliente</strong></span>
          </div>

          <button type="submit" disabled={saving}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
