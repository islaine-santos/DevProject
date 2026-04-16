import type { Proposal } from '../../types';
import { ProposalCard } from './ProposalCard';
import { MAX_PROPOSALS_PER_ORDER } from '../../lib/constants';

interface ProposalComparisonProps {
  proposals: Proposal[];
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  actionLoading?: boolean;
}

export function ProposalComparison({ proposals, onAccept, onReject, actionLoading }: ProposalComparisonProps) {
  const pending = proposals.filter((p) => p.status === 'pendente');
  const responded = proposals.filter((p) => p.status !== 'pendente');

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Propostas Pendentes ({pending.length}/{MAX_PROPOSALS_PER_ORDER})
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Compare as propostas abaixo e escolha a melhor para o seu serviço.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                showActions
                onAccept={onAccept}
                onReject={onReject}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && responded.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-sm">Nenhuma proposta recebida ainda.</p>
          <p className="text-gray-400 text-xs mt-1">Até {MAX_PROPOSALS_PER_ORDER} profissionais podem enviar propostas.</p>
        </div>
      )}

      {responded.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Propostas Anteriores</h3>
          <div className="space-y-3">
            {responded.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
