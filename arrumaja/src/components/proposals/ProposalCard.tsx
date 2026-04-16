import { Check, X, Clock, Eye } from 'lucide-react';
import type { Proposal } from '../../types';
import { formatCurrency, timeAgo } from '../../lib/utils';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '../../lib/constants';

interface ProposalCardProps {
  proposal: Proposal;
  showActions?: boolean;
  onAccept?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  actionLoading?: boolean;
}

export function ProposalCard({ proposal, showActions = false, onAccept, onReject, actionLoading }: ProposalCardProps) {
  const isPending = proposal.status === 'pendente';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {proposal.profissional?.avatar_url ? (
            <img src={proposal.profissional.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {proposal.profissional?.nome?.charAt(0) ?? '?'}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{proposal.profissional?.nome ?? 'Profissional'}</h3>
            <span className="text-xs text-gray-400">{timeAgo(proposal.criado_em)}</span>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PROPOSAL_STATUS_COLORS[proposal.status]}`}>
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </span>
      </div>

      {proposal.necessita_visita_tecnica ? (
        <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-3">
          <Eye className="w-4 h-4" />
          Necessita visita técnica para orçamento
        </div>
      ) : (
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium text-gray-900">Estimativa: </span>
          {proposal.valor_estimado_min != null && proposal.valor_estimado_max != null ? (
            <span className="text-primary-700 font-semibold">
              {formatCurrency(proposal.valor_estimado_min)} – {formatCurrency(proposal.valor_estimado_max)}
            </span>
          ) : (
            <span className="text-gray-400">Não informada</span>
          )}
        </div>
      )}

      {proposal.mensagem && (
        <p className="text-sm text-gray-500 mb-4">{proposal.mensagem}</p>
      )}

      {showActions && isPending && (
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => onAccept?.(proposal.id)}
            disabled={actionLoading}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Aceitar
          </button>
          <button
            onClick={() => onReject?.(proposal.id)}
            disabled={actionLoading}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Recusar
          </button>
        </div>
      )}

      {!isPending && proposal.respondido_em && (
        <div className="flex items-center gap-1 text-xs text-gray-400 pt-2 border-t border-gray-100">
          <Clock className="w-3 h-3" />
          Respondido {timeAgo(proposal.respondido_em)}
        </div>
      )}
    </div>
  );
}
