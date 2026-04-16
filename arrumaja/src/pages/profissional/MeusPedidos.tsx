import { useState } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { OrderCard } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ORDER_STATUS_LABELS } from '../../lib/constants';
import type { OrderStatus } from '../../types';

const FILTERS: (OrderStatus | 'todos')[] = ['todos', 'aceito', 'em_andamento', 'concluido', 'cancelado'];

export function ProfissionalMeusPedidos() {
  const { user } = useAuthContext();
  const { orders, loading } = useOrders({ profissionalId: user?.id });
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos');

  const filtered = filter === 'todos' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === 'todos' ? 'Todos' : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} linkPrefix="/profissional" />
          ))}
        </div>
      )}
    </div>
  );
}
