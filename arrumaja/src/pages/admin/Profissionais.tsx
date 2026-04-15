import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { KYC_STATUS_LABELS, SELO_LABELS, PLAN_LABELS } from '../../lib/constants';
import type { Professional } from '../../types';

export function AdminProfissionais() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('professionals')
        .select('*, user:users!user_id(*)')
        .order('created_at', { ascending: false });

      setProfessionals(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
        <Link to="/admin/kyc" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          Revisar KYC
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">KYC</th>
                <th className="px-4 py-3 font-medium">Selo</th>
                <th className="px-4 py-3 font-medium">Avaliação</th>
                <th className="px-4 py-3 font-medium">Ativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {professionals.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.user?.nome ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.cidade}, {p.estado}</td>
                  <td className="px-4 py-3 text-gray-500">{PLAN_LABELS[p.plano]}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.kyc_status === 'aprovado' ? 'bg-green-100 text-green-700'
                        : p.kyc_status === 'em_analise' ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {KYC_STATUS_LABELS[p.kyc_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{SELO_LABELS[p.selo]}</td>
                  <td className="px-4 py-3 text-gray-500">{p.avaliacao_media.toFixed(1)} ({p.total_avaliacoes})</td>
                  <td className="px-4 py-3">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${p.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
                  </td>
                </tr>
              ))}
              {professionals.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Nenhum profissional cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
