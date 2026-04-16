import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatDateTime } from '../../lib/utils';
import type { Order, OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS } from '../../lib/constants';

const STATUSES: (OrderStatus | 'todos')[] = ['todos', 'aguardando_profissional', 'aceito', 'em_andamento', 'concluido', 'cancelado', 'expirado'];

export function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos');

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*, service:services(*), cliente:users!cliente_id(*), profissional:users!profissional_id(*)')
        .order('criado_em', { ascending: false })
        .limit(100);

      if (filter !== 'todos') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      setOrders(data ?? []);
      setLoading(false);
    }
    fetch();
  }, [filter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === 'todos' ? 'Todos' : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Serviço</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Profissional</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{o.titulo}</td>
                    <td className="px-4 py-3 text-gray-500">{o.service?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{o.cliente?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{o.profissional?.nome ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-gray-400">{formatDateTime(o.criado_em)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
