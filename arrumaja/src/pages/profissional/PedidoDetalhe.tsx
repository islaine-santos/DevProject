import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import type { Order } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatDateTime, formatCurrency } from '../../lib/utils';

export function ProfissionalPedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { acceptOrder, updateOrderStatus } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    if (!id) return;
    const { data } = await supabase
      .from('orders')
      .select('*, categoria:service_categories(*)')
      .eq('id', id)
      .single();
    setOrder(data);
    setLoading(false);
  }

  async function handleAccept() {
    if (!order || !user) return;
    setActionLoading(true);
    await acceptOrder(order.id, user.id);
    await fetchOrder();
    setActionLoading(false);
  }

  async function handleStart() {
    if (!order) return;
    setActionLoading(true);
    await updateOrderStatus(order.id, 'em_andamento');
    await fetchOrder();
    setActionLoading(false);
  }

  async function handleComplete() {
    if (!order) return;
    setActionLoading(true);
    await updateOrderStatus(order.id, 'concluido');
    await fetchOrder();
    setActionLoading(false);
  }

  if (loading) return <LoadingSpinner />;
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Pedido não encontrado.</p>
      </div>
    );
  }

  const isMyOrder = order.profissional_id === user?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/profissional" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao painel
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{order.titulo}</h1>
            {order.categoria && (
              <span className="text-sm text-primary-600 font-medium">{order.categoria.nome}</span>
            )}
          </div>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-gray-600 mb-6">{order.descricao}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{order.endereco}, {order.cidade} - {order.estado}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Criado em {formatDateTime(order.criado_em)}</span>
          </div>
          {order.valor_estimado && (
            <div className="text-gray-700 font-medium">
              Valor estimado: {formatCurrency(order.valor_estimado)}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {order.status === 'aguardando' && !isMyOrder && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Aceitando...' : 'Aceitar Pedido'}
            </button>
          )}
          {order.status === 'aceito' && isMyOrder && (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Iniciando...' : 'Iniciar Serviço'}
            </button>
          )}
          {order.status === 'em_andamento' && isMyOrder && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Concluindo...' : 'Marcar como Concluído'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
