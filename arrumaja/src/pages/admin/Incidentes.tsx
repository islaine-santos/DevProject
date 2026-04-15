import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatDateTime, classNames } from '../../lib/utils';
import type { SecurityIncident, IncidentStatus } from '../../types';

const STATUS_LABELS: Record<IncidentStatus, string> = {
  aberto: 'Aberto',
  em_analise: 'Em Análise',
  resolvido: 'Resolvido',
  arquivado: 'Arquivado',
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  aberto: 'bg-red-100 text-red-700',
  em_analise: 'bg-amber-100 text-amber-700',
  resolvido: 'bg-green-100 text-green-700',
  arquivado: 'bg-gray-100 text-gray-500',
};

export function AdminIncidentes() {
  const [incidents, setIncidents] = useState<(SecurityIncident & { reporter?: { nome: string }; reported?: { nome: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('security_incidents')
        .select('*, reporter:users!reporter_id(nome), reported:users!reported_id(nome)')
        .order('created_at', { ascending: false });

      setIncidents(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  async function updateStatus(id: string, status: IncidentStatus) {
    await supabase.from('security_incidents').update({ status }).eq('id', id);
    setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">Incidentes de Segurança</h1>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Nenhum incidente registrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Tipo: {inc.tipo}</span>
                  <p className="text-sm text-gray-500 mt-1">{inc.descricao}</p>
                </div>
                <span className={classNames('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[inc.status])}>
                  {STATUS_LABELS[inc.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-3">
                <span>Reportado por: <strong className="text-gray-600">{inc.reporter?.nome ?? '—'}</strong></span>
                <span>Reportado: <strong className="text-gray-600">{inc.reported?.nome ?? '—'}</strong></span>
                <span>{formatDateTime(inc.created_at)}</span>
              </div>
              {inc.status !== 'resolvido' && inc.status !== 'arquivado' && (
                <div className="flex gap-2">
                  {inc.status === 'aberto' && (
                    <button onClick={() => updateStatus(inc.id, 'em_analise')}
                      className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-200">
                      Analisar
                    </button>
                  )}
                  <button onClick={() => updateStatus(inc.id, 'resolvido')}
                    className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-200">
                    Resolver
                  </button>
                  <button onClick={() => updateStatus(inc.id, 'arquivado')}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200">
                    Arquivar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
