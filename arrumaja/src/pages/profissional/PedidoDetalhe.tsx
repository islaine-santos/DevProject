import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, MessageCircle, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import type { Order } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Chat } from '../../components/Chat';
import { ReviewForm } from '../../components/ReviewForm';
import { formatDateTime, formatCurrency } from '../../lib/utils';

export function ProfissionalPedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { acceptOrder, updateOrderStatus } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

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

    if (data?.status === 'concluido' && user) {
      const { data: review } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', id)
        .eq('avaliador_id', user.id)
        .maybeSingle();
      setHasReviewed(!!review);
    }
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
  const canChat = isMyOrder && ['aceito', 'em_andamento', 'concluido'].includes(order.status);
  const canReview = order.status === 'concluido' && isMyOrder && !hasReviewed;

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

      {/* Chat section */}
      {canChat && (
        <div className="mt-6">
          <button
            onClick={() => setShowChat(!showChat)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 mb-4"
          >
            <MessageCircle className="w-4 h-4" />
            {showChat ? 'Ocultar chat' : 'Abrir chat com cliente'}
          </button>
          {showChat && <Chat orderId={order.id} />}
        </div>
      )}

      {/* Review section */}
      {canReview && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Avaliar Cliente</h2>
          </div>
          <ReviewForm
            orderId={order.id}
            avaliadoId={order.cliente_id}
            onSubmitted={() => setHasReviewed(true)}
          />
        </div>
      )}
      {hasReviewed && (
        <div className="mt-6 bg-green-50 text-green-700 text-sm p-4 rounded-xl">
          Avaliação enviada. Obrigado!
        </div>
      )}
    </div>
  );
}
