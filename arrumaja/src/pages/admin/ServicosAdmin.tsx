import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Service } from '../../types';

export function AdminServicos() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [icone, setIcone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*').order('nome');
    setServices(data ?? []);
    setLoading(false);
  }

  function startEdit(svc: Service) {
    setEditingId(svc.id);
    setNome(svc.nome);
    setSlug(svc.slug);
    setIcone(svc.icone);
    setDescricao(svc.descricao);
    setShowNew(false);
  }

  function startNew() {
    setEditingId(null);
    setNome('');
    setSlug('');
    setIcone('🔧');
    setDescricao('');
    setShowNew(true);
  }

  function cancelForm() {
    setEditingId(null);
    setShowNew(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      await supabase.from('services').update({ nome, slug, icone, descricao }).eq('id', editingId);
    } else {
      await supabase.from('services').insert({ nome, slug, icone, descricao, ativa: true });
    }

    cancelForm();
    await fetchServices();
    setSaving(false);
  }

  async function toggleActive(svc: Service) {
    await supabase.from('services').update({ ativa: !svc.ativa }).eq('id', svc.id);
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, ativa: !s.ativa } : s));
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <button onClick={startNew}
          className="inline-flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {(showNew || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
              <input type="text" value={icone} onChange={(e) => setIcone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={cancelForm} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {services.map((svc) => (
          <div key={svc.id} className="px-5 py-4 flex items-center gap-4">
            <span className="text-xl">{svc.icone || '🔧'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{svc.nome}</p>
              <p className="text-xs text-gray-400">{svc.slug}</p>
            </div>
            <button onClick={() => startEdit(svc)} className="text-gray-400 hover:text-primary-600">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => toggleActive(svc)} className={svc.ativa ? 'text-green-600' : 'text-gray-400'}>
              {svc.ativa ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
