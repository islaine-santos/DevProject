import { useState } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { OrderCard } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function ProfissionalDashboard() {
  const { user } = useAuthContext();
  const [tab, setTab] = useState<'disponiveis' | 'meus'>('disponiveis');

  const { orders: availableOrders, loading: loadingAvailable } = useOrders({
    status: 'aguardando',
  });
  const { orders: myOrders, loading: loadingMy } = useOrders({
    profissionalId: user?.id,
  });

  const loading = tab === 'disponiveis' ? loadingAvailable : loadingMy;
  const orders = tab === 'disponiveis' ? availableOrders : myOrders;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel do Profissional</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('disponiveis')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'disponiveis'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pedidos Disponíveis
        </button>
        <button
          onClick={() => setTab('meus')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'meus'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Meus Pedidos
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">
            {tab === 'disponiveis'
              ? 'Nenhum pedido disponível no momento.'
              : 'Você ainda não aceitou nenhum pedido.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} linkPrefix="/profissional" />
          ))}
        </div>
      )}
    </div>
  );
}
