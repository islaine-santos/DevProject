import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { OrderCard } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function ClienteDashboard() {
  const { user } = useAuthContext();
  const { orders, loading } = useOrders({ clienteId: user?.id });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe o status dos seus pedidos de serviço
          </p>
        </div>
        <Link
          to="/cliente/novo-pedido"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">Você ainda não tem pedidos</p>
          <Link
            to="/cliente/novo-pedido"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Criar primeiro pedido
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} linkPrefix="/cliente" />
          ))}
        </div>
      )}
    </div>
  );
}
