import { Check, X } from 'lucide-react';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface ProposalCardProps {
  order: Order;
  professionalName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function ProposalCard({ order, professionalName, onAccept, onReject }: ProposalCardProps) {
  return (
    <div className="bg-white rounded-xl border border-indigo-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-1">Proposta de {professionalName}</h3>

      {order.necessita_visita_tecnica ? (
        <p className="text-sm text-amber-600 font-medium mb-3">Necessita visita técnica para orçamento</p>
      ) : (
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium text-gray-900">Estimativa: </span>
          {order.valor_estimado_min != null && order.valor_estimado_max != null ? (
            <span>{formatCurrency(order.valor_estimado_min)} – {formatCurrency(order.valor_estimado_max)}</span>
          ) : (
            <span className="text-gray-400">Não informada</span>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onAccept} className="flex-1 inline-flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          <Check className="w-4 h-4" /> Aceitar
        </button>
        <button onClick={onReject} className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
          <X className="w-4 h-4" /> Recusar
        </button>
      </div>
    </div>
  );
}
