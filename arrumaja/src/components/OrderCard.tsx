import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import type { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { timeAgo, formatCurrency } from '../lib/utils';

interface OrderCardProps {
  order: Order;
  linkPrefix: string;
}

export function OrderCard({ order, linkPrefix }: OrderCardProps) {
  return (
    <Link
      to={`${linkPrefix}/pedido/${order.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{order.titulo}</h3>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{order.descricao}</p>
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {order.cidade}, {order.estado}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo(order.criado_em)}
        </span>
        {order.valor_estimado_min != null && order.valor_estimado_max != null && (
          <span className="font-medium text-gray-600">
            {formatCurrency(order.valor_estimado_min)} – {formatCurrency(order.valor_estimado_max)}
          </span>
        )}
        {order.necessita_visita_tecnica && (
          <span className="text-amber-600 font-medium">Visita técnica</span>
        )}
        {order.genero_preferencia === 'feminino' && (
          <span className="text-pink-600 font-medium">Só mulheres</span>
        )}
      </div>
    </Link>
  );
}
