import { useEffect, useState } from 'react';
import { Megaphone, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import type { Campaign } from '../../types';

export function AdminCampanhas() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      setCampaigns(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  async function toggleActive(campaign: Campaign) {
    await supabase.from('campaigns').update({ ativa: !campaign.ativa }).eq('id', campaign.id);
    setCampaigns((prev) => prev.map((c) => c.id === campaign.id ? { ...c, ativa: !c.ativa } : c));
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="w-6 h-6 text-pink-600" />
        <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Nenhuma campanha cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{c.nome}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{c.descricao}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-400">
                  <span>ONG: {c.ong_nome}</span>
                  {c.inicio && <span>Início: {formatDate(c.inicio)}</span>}
                  {c.fim && <span>Fim: {formatDate(c.fim)}</span>}
                </div>
              </div>
              <button onClick={() => toggleActive(c)} className={c.ativa ? 'text-green-600' : 'text-gray-400'}>
                {c.ativa ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
