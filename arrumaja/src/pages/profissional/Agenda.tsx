import { Calendar } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { OrderCard } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function ProfissionalAgenda() {
  const { user } = useAuthContext();
  const { orders, loading } = useOrders({ profissionalId: user?.id });

  const activeOrders = orders.filter((o) => ['aceito', 'em_andamento'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'concluido').slice(0, 5);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Serviços Ativos ({activeOrders.length})
          </h2>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-sm">Nenhum serviço ativo no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} linkPrefix="/profissional" />
              ))}
            </div>
          )}
        </div>

        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Concluídos</h2>
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} linkPrefix="/profissional" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
