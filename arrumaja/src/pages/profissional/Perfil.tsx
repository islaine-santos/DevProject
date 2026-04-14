import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { ESTADOS_BR } from '../../lib/constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AvatarUpload } from '../../components/AvatarUpload';
import type { ProfessionalProfile } from '../../types';

export function ProfissionalPerfil() {
  const { user } = useAuthContext();
  const { categories, loading: catLoading } = useCategories();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [disponivel, setDisponivel] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!user) return;
      const { data } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setBio(data.bio);
        setSelectedCategories(data.categorias);
        setCidade(data.cidade);
        setEstado(data.estado);
        setDisponivel(data.disponivel);
      }
      if (user) {
        setAvatarUrl(user.avatar_url);
      }
      setLoading(false);
    }
    fetch();
  }, [user]);

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug)
        ? prev.filter((c) => c !== slug)
        : [...prev, slug]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');

    const payload = {
      user_id: user.id,
      bio,
      categorias: selectedCategories,
      cidade,
      estado,
      disponivel,
    };

    if (profile) {
      const { error } = await supabase
        .from('professional_profiles')
        .update(payload)
        .eq('id', profile.id);

      setMessage(error ? 'Erro ao salvar.' : 'Perfil atualizado!');
    } else {
      const { error } = await supabase
        .from('professional_profiles')
        .insert(payload);

      setMessage(error ? 'Erro ao criar perfil.' : 'Perfil criado!');
    }
    setSaving(false);
  }

  if (loading || catLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Meu Perfil Profissional</h1>
      <p className="text-gray-500 mb-8">Configure suas informações e categorias de serviço</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <AvatarUpload currentUrl={avatarUrl} onUploaded={setAvatarUrl} />
        </div>

        {message && (
          <div className={`text-sm p-3 rounded-lg ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio / Descrição
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Fale sobre você e sua experiência..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorias de serviço
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat.slug)
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              id="cidade"
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">UF</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="disponivel"
            type="checkbox"
            checked={disponivel}
            onChange={(e) => setDisponivel(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="disponivel" className="text-sm text-gray-700">
            Estou disponível para novos serviços
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  );
}
