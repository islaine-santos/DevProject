import { useState, type FormEvent } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useProfessional } from '../../hooks/useProfessional';
import { useServices } from '../../hooks/useServices';
import { ESTADOS_BR } from '../../lib/constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AvatarUpload } from '../../components/AvatarUpload';

export function ProfissionalPerfil() {
  const { user } = useAuthContext();
  const { professional, loading: proLoading, updateProfile } = useProfessional(user?.id);
  const { services, loading: svcLoading } = useServices();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url ?? null);
  const [bio, setBio] = useState(professional?.bio ?? '');
  const [cidade, setCidade] = useState(professional?.cidade ?? '');
  const [estado, setEstado] = useState(professional?.estado ?? '');
  const [regiao, setRegiao] = useState(professional?.regiao_atuacao ?? '');
  const [disponivel, setDisponivel] = useState(professional?.disponivel ?? true);

  // Sync state when professional loads
  if (professional && !bio && professional.bio) {
    setBio(professional.bio);
    setCidade(professional.cidade);
    setEstado(professional.estado);
    setRegiao(professional.regiao_atuacao);
    setDisponivel(professional.disponivel);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { error } = await updateProfile({ bio, cidade, estado, regiao_atuacao: regiao, disponivel });
    setMessage(error ? 'Erro ao salvar.' : 'Perfil atualizado!');
    setSaving(false);
  }

  if (proLoading || svcLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Meu Perfil Profissional</h1>
      <p className="text-gray-500 mb-8">Configure suas informações</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex justify-center">
          <AvatarUpload currentUrl={avatarUrl} onUploaded={setAvatarUrl} />
        </div>

        {message && (
          <div className={`text-sm p-3 rounded-lg ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio / Descrição</label>
          <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Fale sobre você e sua experiência..." />
        </div>

        <div>
          <label htmlFor="regiao" className="block text-sm font-medium text-gray-700 mb-1">Região de atuação</label>
          <input id="regiao" type="text" value={regiao} onChange={(e) => setRegiao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Ex: Zona Sul, Centro..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input id="cidade" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="">UF</option>
              {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>

        {services.length > 0 && professional?.services && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Serviços</label>
            <div className="flex flex-wrap gap-2">
              {services.map((svc) => (
                <span key={svc.id} className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200">
                  {svc.nome}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Serviços são gerenciados pelo administrador.</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input id="disponivel" type="checkbox" checked={disponivel} onChange={(e) => setDisponivel(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
          <label htmlFor="disponivel" className="text-sm text-gray-700">Estou disponível para novos serviços</label>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  );
}
