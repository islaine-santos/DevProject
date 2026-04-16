import { useEffect, useState } from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Professional } from '../../types';

export function AdminKycReview() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    const { data } = await supabase
      .from('professionals')
      .select('*, user:users!user_id(*)')
      .eq('kyc_status', 'em_analise')
      .order('created_at', { ascending: true });

    setProfessionals(data ?? []);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    setActionLoading(id);
    await supabase
      .from('professionals')
      .update({ kyc_status: 'aprovado', kyc_tier: 2, selo: 'verificado' })
      .eq('id', id);
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    await supabase
      .from('professionals')
      .update({ kyc_status: 'reprovado' })
      .eq('id', id);
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
    setActionLoading(null);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-7 h-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Revisão KYC</h1>
        <span className="bg-amber-100 text-amber-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {professionals.length} pendente{professionals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {professionals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma verificação pendente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {professionals.map((p) => {
            const docs = p.kyc_docs as Record<string, string>;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.user?.nome ?? 'Profissional'}</h3>
                    <p className="text-sm text-gray-500">{p.user?.email} — {p.cidade}, {p.estado}</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Em Análise</span>
                </div>

                {docs && Object.keys(docs).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos enviados:</h4>
                    <ul className="space-y-1 text-sm text-gray-500">
                      {Object.entries(docs).map(([key, val]) => (
                        <li key={key}>
                          <span className="font-medium text-gray-700">{key}:</span>{' '}
                          <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate">
                            {val}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                    <Check className="w-4 h-4" /> Aprovar
                  </button>
                  <button onClick={() => handleReject(p.id)} disabled={actionLoading === p.id}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50">
                    <X className="w-4 h-4" /> Reprovar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
