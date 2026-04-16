import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, MessageCircle, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useProposals } from '../../hooks/useProposals';
import type { Order } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Chat } from '../../components/Chat';
import { ReviewForm } from '../../components/ReviewForm';
import { OrderTimeline } from '../../components/orders/OrderTimeline';
import { ProposalComparison } from '../../components/proposals/ProposalComparison';
import { formatDateTime, formatCurrency } from '../../lib/utils';

export function ClientePedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { proposals, loading: proposalsLoading, acceptProposal, rejectProposal } = useProposals(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    if (!id) return;
    const { data } = await supabase
      .from('orders')
      .select('*, service:services(*), profissional:users!profissional_id(*)')
      .eq('id', id)
      .single();
    setOrder(data);
    setLoading(false);

    if (data?.status === 'concluido' && data?.cliente_id) {
      const { data: review } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', id)
        .eq('avaliador_id', data.cliente_id)
        .maybeSingle();
      setHasReviewed(!!review);
    }
  }

  async function handleAcceptProposal(proposalId: string) {
    if (!order) return;
    setActionLoading(true);
    await acceptProposal(proposalId, order.id);
    await fetchOrder();
    setActionLoading(false);
  }

  async function handleRejectProposal(proposalId: string) {
    setActionLoading(true);
    await rejectProposal(proposalId);
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

  const canChat = ['aceito', 'em_andamento', 'concluido'].includes(order.status);
  const canReview = order.status === 'concluido' && order.profissional_id && !hasReviewed;
  const showProposals = ['aguardando_profissional', 'aceito'].includes(order.status) || proposals.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/cliente" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar aos pedidos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{order.titulo}</h1>
                {order.service && <span className="text-sm text-primary-600 font-medium">{order.service.nome}</span>}
              </div>
              <StatusBadge status={order.status} />
            </div>

            <p className="text-gray-600 mb-6">{order.descricao}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{order.endereco}, {order.cidade} - {order.estado}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Criado em {formatDateTime(order.criado_em)}</span>
              </div>
              {order.genero_preferencia === 'feminino' && (
                <div className="text-pink-600 font-medium">Preferência: Só mulheres</div>
              )}
              {order.valor_final != null && (
                <div className="text-green-700 font-medium">Valor final: {formatCurrency(order.valor_final)}</div>
              )}
              {order.aceito_em && <div className="text-gray-500">Aceito em {formatDateTime(order.aceito_em)}</div>}
              {order.concluido_em && <div className="text-green-600 font-medium">Concluído em {formatDateTime(order.concluido_em)}</div>}
            </div>
          </div>

          {/* Proposals Section */}
          {showProposals && !proposalsLoading && (
            <ProposalComparison
              proposals={proposals}
              onAccept={handleAcceptProposal}
              onReject={handleRejectProposal}
              actionLoading={actionLoading}
            />
          )}
          {actionLoading && <p className="text-sm text-gray-500 text-center">Processando...</p>}

          {/* Chat section */}
          {canChat && (
            <div>
              <button onClick={() => setShowChat(!showChat)}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 mb-4">
                <MessageCircle className="w-4 h-4" />
                {showChat ? 'Ocultar chat' : 'Abrir chat com profissional'}
              </button>
              {showChat && <Chat orderId={order.id} />}
            </div>
          )}

          {/* Review section */}
          {canReview && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">Avaliar Profissional</h2>
              </div>
              <ReviewForm orderId={order.id} avaliadoId={order.profissional_id!} onSubmitted={() => setHasReviewed(true)} />
            </div>
          )}
          {hasReviewed && (
            <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl">Você já avaliou este serviço. Obrigado!</div>
          )}
        </div>

        {/* Sidebar - Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Status do Pedido</h2>
            <OrderTimeline currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
