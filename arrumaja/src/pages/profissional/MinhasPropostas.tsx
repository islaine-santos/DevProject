import { Link } from 'react-router-dom';
import { FileText, MapPin } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useMyProposals } from '../../hooks/useProposals';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '../../lib/constants';
import { formatCurrency, timeAgo } from '../../lib/utils';

export function MinhasPropostas() {
  const { user } = useAuthContext();
  const { proposals, loading } = useMyProposals(user?.id);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Minhas Propostas</h1>

      {proposals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Você ainda não enviou nenhuma proposta.</p>
          <Link to="/profissional" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Ver pedidos disponíveis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <Link
              key={p.id}
              to={`/profissional/pedido/${p.order_id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {p.order?.titulo ?? 'Pedido'}
                </h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${PROPOSAL_STATUS_COLORS[p.status]}`}>
                  {PROPOSAL_STATUS_LABELS[p.status]}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-2">
                {p.order?.cidade && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {p.order.cidade}, {p.order.estado}
                  </span>
                )}
                <span>{timeAgo(p.criado_em)}</span>
              </div>

              <div className="text-sm text-gray-600">
                {p.necessita_visita_tecnica ? (
                  <span className="text-amber-600 font-medium">Visita técnica necessária</span>
                ) : p.valor_estimado_min != null && p.valor_estimado_max != null ? (
                  <span>
                    Estimativa: <span className="font-medium text-gray-900">{formatCurrency(p.valor_estimado_min)} – {formatCurrency(p.valor_estimado_max)}</span>
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
